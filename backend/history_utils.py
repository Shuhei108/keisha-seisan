import redis
import json
import uuid

def get_redis_client():
    import os
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_db = int(os.getenv("REDIS_DB", 0))
    return redis.Redis(host=redis_host, port=redis_port, db=redis_db, decode_responses=True)

def get_session_id(request, response):
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session_id", value=session_id, httponly=True, samesite="lax")
    return session_id

def reset_history(redis_client, session_id):
    history_key = f"chat_history:{session_id}"
    redis_client.delete(history_key)

def get_history(redis_client, session_id, settlement_info, user_message):
    history_key = f"chat_history:{session_id}"
    history_json = redis_client.get(history_key)
    history = json.loads(history_json) if history_json else []
    # 初回プロンプトやアシスタント応答を必要に応じて追加
    req = settlement_info.get("request", {})
    res = settlement_info.get("response", {})
    from constForPrompt import ConstForPrompt
    CONST = ConstForPrompt
    participants = req.get("participants", {})
    settlement_plan = res.get("settlement_plan", [])
    surplus = res.get("surplus", None)
    total_amount = res.get("total_amount", None)

    if len(history) == 0:
        first_message = CONST.PROMPT_FOR_NO_RULES.format(
            CONST.AMOUNT_FORMAT.format(req.get("amount", 0)),
            "".join(CONST.PARTICIPANT_FORMAT.format("", name, p.get(CONST.COUNT, 0)) for name, p in participants.items())
        )
        history.append({"role": "user", "content": first_message})

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
    history.append({"role": "user", "content": user_message})
    return history

def save_history(redis_client, session_id, history, ai_result):
    history.append({"role": "assistant", "content": ai_result})
    history_key = f"chat_history:{session_id}"
    redis_client.set(history_key, json.dumps(history), ex=3600)

def save_settlement_info(redis_client, session_id, data, result):
    settlement_info = {
        "request": data.model_dump(),
        "response": result
    }
    redis_client.set(f"settlements:{session_id}", json.dumps(settlement_info), ex=3600)

def get_settlement_info(redis_client, session_id):
    settlement_json = redis_client.get(f"settlements:{session_id}")
    return json.loads(settlement_json) if settlement_json else None

# get_redis_client, get_session_idはmain.pyから利用されます
