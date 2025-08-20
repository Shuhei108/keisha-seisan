import os
import json
from datetime import datetime, timezone

def write_log(log_type: str, body: dict):
    """
    リクエスト・レスポンス情報をlogファイルに追記する
    """
    log_dir = "logs"
    log_path = os.path.join(log_dir, "request_response.log")
    os.makedirs(log_dir, exist_ok=True)
    log_entry = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "type": log_type,
        "body": body
    }
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
