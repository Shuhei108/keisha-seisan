from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from constForPrompt import ConstForPrompt
import os
from dotenv import load_dotenv
import json
from history_utils import get_redis_client, get_session_id

from schemas import RequestFormat, chatRequestFormat
from validators import validate_request
from logic import (
    calc_simple_settlement,
    generate_response_with_rules,
    generate_chat_response
)
from logger import write_log

CONST = ConstForPrompt

# 環境変数をロード
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOW_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redisクライアントを初期化
redis_client = get_redis_client()

@app.post("/v1/calc")
async def calculate_settlement(
    data: RequestFormat,
    request: Request,
    response: Response
):
    # セッションIDをcookieから取得、なければ新規発行
    session_id = get_session_id(request, response)
    
    # セッションIDをキーにしてRedisの情報をクリア
    history_key = f"chat_history:{session_id}"
    redis_client.delete(history_key)

    # リクエストログ出力
    write_log("request", data.model_dump())

    # 入力バリデーション
    try:
        validate_request(data)
    except HTTPException as e:
        raise e

    # 正常処理
    if not data.rules:
        result = calc_simple_settlement(data.amount, data.participants)
    else:
        # generate_response_with_rulesの引数を修正
        result = generate_response_with_rules(
            data.amount, data.participants, data.rules, data.model, session_id, redis_client
        )

    # レスポンスログ出力
    write_log("response", result)

    # 精算情報を抽出してRedisに追加（セッションIDで管理、1ユーザー1件のみ保持）
    settlement_info = {
        "request": data.model_dump(),
        "response": result
    }
    redis_client.set(f"settlements:{session_id}", json.dumps(settlement_info), ex=3600)

    return result

@app.post("/v1/chat")
async def ai_chat(
    data: chatRequestFormat,
    request: Request,
    response: Response
):
    # セッションIDをcookieから取得（get_session_idで統一）
    session_id = get_session_id(request, response)

    # Redisから直近の計算結果を取得
    settlement_json = redis_client.get(f"settlements:{session_id}")
    if not settlement_json:
        raise HTTPException(status_code=404, detail="計算結果が見つかりません。")

    settlement_info = json.loads(settlement_json)
    # --- 会話履歴を取得 ---
    history_key = f"chat_history:{session_id}"
    history_json = redis_client.get(history_key)
    history = json.loads(history_json) if history_json else []
    
    # settlement_infoから必要な情報を抽出
    req = settlement_info.get("request", {})
    res = settlement_info.get("response", {})
    participants = req.get("participants", {})
    settlement_plan = res.get("settlement_plan", [])
    surplus = res.get("surplus", None)
    total_amount = res.get("total_amount", None)

    # 初回プロンプト追加
    if len(history) == 0:
        first_message = CONST.PROMPT_FOR_NO_RULES.format(
            CONST.AMOUNT_FORMAT.format(req.get("amount", 0)),
            "".join(CONST.PARTICIPANT_FORMAT.format("", name, p.get(CONST.COUNT, 0)) for name, p in participants.items())
        )
        history.append({"role": "user", "content": first_message})

    # 1回目のassistant応答追加
    if len([h for h in history if h["role"] == "user"]) < 2:
        lines = []
        lines.append("計算結果:")
        lines.append("役職名 | 人数 | 一人当たりの支払金額")
        lines.append("------------------------------")
        for plan in settlement_plan:
            name = plan.get("participant", "")
            count = participants.get(name, {}).get("人数", "")
            amount = plan.get("amount", "")
            lines.append(f"{name} | {count} | {amount}円")
        if surplus is not None:
            lines.append(f"\n余り: {surplus}円")
        if total_amount is not None:
            lines.append(f"合計金額: {total_amount}円")
        assistant_prompt = "\n".join(lines)
        history.append({"role": "assistant", "content": assistant_prompt})

    # ユーザーの新しいメッセージを履歴に追加
    history.append({"role": "user", "content": data.message})

    # プロンプト生成とAI呼び出し（履歴を渡す）
    ai_result = generate_chat_response(settlement_info, data.message, history=history)

    # AI応答も履歴に追加して保存
    history.append({"role": "assistant", "content": ai_result})
    redis_client.set(history_key, json.dumps(history), ex=3600)
    # ---

    return {"message": ai_result}
