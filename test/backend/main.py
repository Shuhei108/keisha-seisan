from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import constForPrompt
import json
import math  
import os
from dotenv import load_dotenv

# 環境変数をロード
load_dotenv()

# 定数クラス
CONST = constForPrompt.ConstForPrompt

# リクエストフォーマット
class RequestFormat(BaseModel):
    amount: int
    participants: Dict[str, Dict[str, int]] = Field(..., min_length=1)
    rules: List[str] = None
    model: str = None

# FastAPIのインスタンスを作成
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOW_ORIGINS", "").split(","),  # 環境変数から取得
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIキー設定
genai.configure(api_key=os.getenv("API_KEY"))  # 環境変数から取得

response_schema = {
    "type": "object",
    "properties": {
        "settlement_plan": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "participant": {"type": "string"},
                    "amount": {"type": "integer"},
                    "count": {"type": "integer"}
                },
                "required": ["participant", "amount", "count"]
            }
        },
        "surplus": {  
            "type": "integer",
            "description": "割り切れなかった場合の余剰金。割り切れる場合は含まれない。"
        }
    },
    "required": ["settlement_plan"]
}

@app.post("/v1/calc")
async def calculate_settlement(data: RequestFormat):
    """
    清算金額を計算するエンドポイント
    """
     # amountのチェック
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="amountは正の整数である必要があります。")

    # participants数のチェック
    if len(data.participants) > 20:
        raise HTTPException(status_code=400, detail="participantsの数は最大20人までです。")

    # participants内容のチェック
    for name, info in data.participants.items():
        if not name.strip():
            raise HTTPException(status_code=400, detail="参加者名（participantsのキー）が空文字または空白のみです。")
        if not isinstance(info, dict):
            raise HTTPException(status_code=400, detail=f"{name}の情報が不正です。")
        if CONST.COUNT not in info or CONST.WEIGHT not in info:
            raise HTTPException(status_code=400, detail=f"{name}のデータに必要なキー（count, weight）が不足しています。")
        if not isinstance(info[CONST.COUNT], int) or info[CONST.COUNT] <= 0:
            raise HTTPException(status_code=400, detail=f"{name}のcountは正の整数である必要があります。")
        if not isinstance(info[CONST.WEIGHT], int) or info[CONST.WEIGHT] <= 0:
            raise HTTPException(status_code=400, detail=f"{name}のweightは正の整数である必要があります。")

    # rulesのチェック（任意だが、存在する場合は検査）
    if data.rules:
        if len(data.rules) > 10:
            raise HTTPException(status_code=400, detail="rulesの数は最大10個までです。")
        for i, rule in enumerate(data.rules):
            if not isinstance(rule, str) or not rule.strip():
                raise HTTPException(status_code=400, detail=f"rules[{i}] が空文字または空白のみです。")

    # 正常処理
    if not data.rules:
        return calc_simple_settlement(data.amount, data.participants)
    else:
        return generate_response_with_rules(data.amount, data.participants, data.rules, data.model)

def calc_simple_settlement(amount: int, participants: Dict[str, Dict[str, int]]):
    """
    単純な割り勘計算を行う。
    """
    total_weight = sum(p[CONST.COUNT] * p[CONST.WEIGHT] for p in participants.values())
    settlement_plan = [
        {"participant": name, "amount": math.ceil(amount * p[CONST.WEIGHT] / total_weight)}
        for name, p in participants.items()
    ]
    return {"settlement_plan": settlement_plan, "total_amount": sum(item["amount"] for item in settlement_plan)}

def generate_response_with_rules(amount: int, participants: Dict[str, Dict[str, int]], rules: List[str], model_name: str = None):
    """
    ルールを考慮した清算計算をGemini APIを用いて行う。
    """
    try:
        model = genai.GenerativeModel(model_name=model_name, tools='code_execution')
        modelForRes = genai.GenerativeModel(model_name=model_name)

        
        messages = [
            {'role': 'user', 'parts': CONST.SYSTEM_PROMPT},
            {'role': 'model', 'parts': '承知しました。'}
        ]
        
        prompt = CONST.PROMPT.format(
            CONST.AMOUNT_FORMAT.format(amount),
            format_participants(participants),
            format_temp_calculation(amount, participants),
            CONST.DEFAULT_RULE_FORMAT.format(CONST.GREATER_THAN.join(participants)),
            format_additional_rules(rules)
        )   
        messages.append({'role': 'user', 'parts': [prompt]})
        
        res = model.generate_content(messages, generation_config=genai.GenerationConfig(
            temperature=0.0, top_k=1, top_p=0.3
        ))
        
        messages.append({'role': 'model', 'parts': res.text})
        messages.append({'role': 'user', 'parts': CONST.PRMPT_FOR_ANS})
        
        res = modelForRes.generate_content(messages, generation_config=genai.GenerationConfig(
            response_mime_type="application/json", response_schema=response_schema,
            temperature=0.0, top_k=1, top_p=0.3
        ))
        
        obj = json.loads(res.text)
        obj["total_amount"] = sum(
            p["amount"] * participants[p["participant"]][CONST.COUNT] for p in obj["settlement_plan"]
        )
        if "surplus" in obj:
            obj["total_amount"] += obj["surplus"]

        return obj
    except Exception as e:
        print(f"APIエラー: {e}") 
        return {
            "error": "APIエラー",
        }

def format_participants(participants: Dict[str, Dict[str, int]]) -> str:
    """
    参加者リストをプロンプト用にフォーマットする。
    """
    return "".join(CONST.PARTICIPANT_FORMAT.format("", name, p[CONST.COUNT]) for name, p in participants.items())

def format_temp_calculation(amount: int, participants: Dict[str, Dict[str, int]]) -> str:
    """
    仮計算のフォーマットを作成する。
    """
    total_weight = sum(p[CONST.COUNT] * p[CONST.WEIGHT] for p in participants.values())
    return "".join(
        CONST.CULC_FORMAT.format("", name, int(amount * p[CONST.WEIGHT] / total_weight))
        for name, p in participants.items()
    )

def format_additional_rules(rules: List[str]) -> str:
    """
    追加ルールをプロンプト用にフォーマットする。
    """
    return "".join(CONST.ADDING_RULE_FORMAT.format("", i + 2, rule) for i, rule in enumerate(rules)) if rules else ""
