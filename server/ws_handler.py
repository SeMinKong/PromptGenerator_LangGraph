import json
from dataclasses import dataclass, asdict
from typing import Any


@dataclass
class ServerMessage:
    type: str
    node: str | None = None
    content: str | None = None
    message: str | None = None
    revision: int | None = None
    max_revisions: int | None = None

    def to_json(self) -> str:
        return json.dumps({k: v for k, v in asdict(self).items() if v is not None})


def make_node_start(node: str, revision: int = 0, max_revisions: int = 3) -> str:
    return ServerMessage(
        type="node_start",
        node=node,
        revision=revision if revision > 0 else None,
        max_revisions=max_revisions if revision > 0 else None,
    ).to_json()


def make_node_end(node: str) -> str:
    return ServerMessage(type="node_end", node=node).to_json()


def make_ai_message(content: str) -> str:
    return ServerMessage(type="ai_message", content=content).to_json()


def make_final_prompt(content: str) -> str:
    return ServerMessage(type="final_prompt", content=content).to_json()


def make_error(message: str) -> str:
    return ServerMessage(type="error", message=message).to_json()


def parse_client_message(text: str) -> dict[str, Any]:
    """Parse and validate a client JSON message. Raises ValueError on bad input."""
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}") from e
    if "type" not in data:
        raise ValueError("Missing 'type' field in client message")
    return data
