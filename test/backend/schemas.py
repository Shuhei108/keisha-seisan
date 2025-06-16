from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class RequestFormat(BaseModel):
    amount: int
    participants: Dict[str, Dict[str, int]] = Field(..., min_length=1)
    rules: Optional[List[str]] = None
    model: Optional[str] = None

class chatRequestFormat(BaseModel):
    message: str

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
