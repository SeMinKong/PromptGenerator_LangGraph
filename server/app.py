from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from langchain_core.messages import HumanMessage

from server.session import store
from server.graph_runner import run_graph
from server.ws_handler import parse_client_message, make_error

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app = FastAPI(title="Prompt Generator")
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
async def index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


class SessionRequest(BaseModel):
    api_key: str = ""


@app.post("/api/session")
async def create_session(body: SessionRequest = SessionRequest()):
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
