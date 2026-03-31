import asyncio
import os
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from langchain_core.messages import HumanMessage
from langchain_upstage import ChatUpstage

from server.session import store
from server.graph_runner import run_graph
from server.ws_handler import parse_client_message, make_error

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app = FastAPI(title="Prompt Generator")
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.api_route("/", methods=["GET", "HEAD"])
async def index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok"}


class SessionRequest(BaseModel):
    api_key: str = ""


def _check_api_key(api_key: str) -> bool:
    """Make a minimal call to verify the Upstage API key is valid."""
    try:
        llm = ChatUpstage(api_key=api_key, model="solar-pro")
        llm.invoke([HumanMessage(content="hi")])
        return True
    except Exception:
        return False


@app.post("/api/session")
async def create_session(body: SessionRequest = SessionRequest()):
    key_to_use = body.api_key or os.getenv("UPSTAGE_API_KEY", "")
    if not key_to_use:
        return JSONResponse(status_code=400, content={"error": "API 키가 필요합니다."})

    if not await asyncio.to_thread(_check_api_key, key_to_use):
        return JSONResponse(status_code=401, content={"error": "유효하지 않은 API 키입니다."})

    session_id = await store.create_session(api_key=body.api_key)
    return {"session_id": session_id}


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    state = await store.get_session(session_id)
    if state is None:
        await websocket.send_text(make_error("Session not found"))
        await websocket.close()
        return

    async def send(message: str) -> None:
        await websocket.send_text(message)

    try:
        while True:
            raw = await websocket.receive_text()

            try:
                msg = parse_client_message(raw)
            except ValueError as e:
                await send(make_error(str(e)))
                continue

            msg_type = msg.get("type")

            if msg_type == "reset":
                await store.reset_session(session_id)
                state = await store.get_session(session_id)  # refresh local ref
                await send('{"type":"session_reset"}')
                continue

            if msg_type == "user_message":
                content = msg.get("content", "").strip()
                if not content:
                    await send(make_error("Empty message"))
                    continue

                state["messages"] = list(state.get("messages", [])) + [
                    HumanMessage(content=content)
                ]

                try:
                    state = await run_graph(state, send)
                    await store.update_session(session_id, state)
                except Exception as e:
                    await send(make_error(f"Graph error: {e}"))
                continue

            await send(make_error(f"Unknown message type: {msg_type}"))

    except WebSocketDisconnect:
        await store.delete_session(session_id)
