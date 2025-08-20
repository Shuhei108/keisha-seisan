from fastapi import HTTPException
from constForPrompt import ConstForPrompt

CONST = ConstForPrompt

def validate_request(data):
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
