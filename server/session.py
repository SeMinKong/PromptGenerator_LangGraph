import asyncio
import uuid
from typing import Optional

from state import PromptState


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, PromptState] = {}
        self._lock = asyncio.Lock()

    async def create_session(self, api_key: str = "") -> str:
        session_id = str(uuid.uuid4())
        async with self._lock:
            self._sessions[session_id] = PromptState(
                messages=[],
                missing_info=[],
                current_draft="",
                api_key=api_key,
            )
        return session_id

    async def get_session(self, session_id: str) -> Optional[PromptState]:
        async with self._lock:
            return self._sessions.get(session_id)

    async def update_session(self, session_id: str, state: PromptState) -> None:
        async with self._lock:
            self._sessions[session_id] = state

    async def reset_session(self, session_id: str) -> None:
        async with self._lock:
            existing = self._sessions.get(session_id, {})
            self._sessions[session_id] = PromptState(
                messages=[],
                missing_info=[],
                current_draft="",
                api_key=existing.get("api_key", ""),
            )

    async def delete_session(self, session_id: str) -> None:
        async with self._lock:
            self._sessions.pop(session_id, None)


# Module-level singleton
store = SessionStore()
