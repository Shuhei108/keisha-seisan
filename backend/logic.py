import math
import json
import google.generativeai as genai
import os
from dotenv import load_dotenv
from constForPrompt import ConstForPrompt
from schemas import response_schema

CONST = ConstForPrompt

# APIキー設定
load_dotenv()
genai.configure(api_key=os.getenv("API_KEY"))

def calc_simple_settlement(amount: int, participants):
    total_weight = sum(p[CONST.COUNT] * p[CONST.WEIGHT] for p in participants.values())
    settlement_plan = [
        {"participant": name, "amount": math.ceil(amount * p[CONST.WEIGHT] / total_weight)}
        for name, p in participants.items()
    ]
    # 余剰金計算
    surplus = sum(item["amount"] for item in settlement_plan) - amount
    if surplus != 0:
        settlement_plan[0]["amount"] -= surplus
    return {"settlement_plan": settlement_plan, "total_amount": sum(item["amount"] for item in settlement_plan)}

def generate_response_with_rules(amount: int, participants, rules, model_name, session_id, redis_client):
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
        # 履歴保存
        history_key = f"chat_history:{session_id}"
        history = [{"role": "user", "content": prompt}]
        redis_client.set(history_key, json.dumps(history))

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

def format_participants(participants):
    return "".join(CONST.PARTICIPANT_FORMAT.format("", name, p[CONST.COUNT]) for name, p in participants.items())

def format_temp_calculation(amount, participants):
    total_weight = sum(p[CONST.COUNT] * p[CONST.WEIGHT] for p in participants.values())
    return "".join(
        CONST.CULC_FORMAT.format("", name, int(amount * p[CONST.WEIGHT] / total_weight))
        for name, p in participants.items()
    )

def format_additional_rules(rules):
    return "".join(CONST.ADDING_RULE_FORMAT.format("", i + 2, rule) for i, rule in enumerate(rules)) if rules else ""

def generate_chat_response(settlement_info, user_message, history=None):
    """
    settlement_info: {"request": {...}, "response": {...}}
    user_message: ユーザーからの調整指示
    history: [{"role": "user"/"assistant", "content": ...}, ...]
    """
    try:
        req = settlement_info.get("request", {})
        model_name = req.get("model", "gemini-2.0-flash-lite")
        prompt = user_message

        # 会話履歴をAIに渡す
        model = genai.GenerativeModel(model_name=model_name)
        messages = []
        if history:
            for h in history:
                if h["role"] == "user":
                    messages.append({'role': 'user', 'parts': h["content"]})
                elif h["role"] == "assistant":
                    messages.append({'role': 'model', 'parts': h["content"]})
        messages.append({'role': 'user', 'parts': prompt})

        res = model.generate_content(messages, generation_config=genai.GenerationConfig(
            temperature=0.0, top_k=1, top_p=0.3
        ))

        return res.text
    except Exception as e:
        print(f"AIチャットエラー: {e}")
        return "AI応答の生成中にエラーが発生しました。"