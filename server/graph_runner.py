import asyncio
import threading
from collections.abc import Callable, Awaitable

from state import PromptState
from graph import app
from server.ws_handler import make_node_start, make_node_end, make_final_prompt

SendFn = Callable[[str], Awaitable[None]]

_EVAL_MARKERS = ("<!-- eval:good -->", "<!-- eval:needs_improvement -->")
_SENTINEL = object()


def _strip_eval_markers(text: str) -> str:
    for marker in _EVAL_MARKERS:
        text = text.replace(marker, "")
    return text.strip()


async def run_graph(state: PromptState, send: SendFn) -> PromptState:
    """
    Stream the LangGraph app, emitting WebSocket node events in real-time.
    Uses a Queue so each node_start/node_end is sent as the node completes,
    not buffered until the full graph finishes.
    Returns the final updated state.
    """
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _stream_in_thread() -> None:
        """Run app.stream() in a background thread, pushing chunks into the queue."""
        try:
            for chunk in app.stream(state, stream_mode="updates"):
                asyncio.run_coroutine_threadsafe(queue.put(chunk), loop).result()
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(_SENTINEL), loop).result()

    thread = threading.Thread(target=_stream_in_thread, daemon=True)
    thread.start()

    updated_state = dict(state)

    while True:
        item = await queue.get()
        if item is _SENTINEL:
            break

        node_name, node_state = next(iter(item.items()))

        await send(make_node_start(node_name))
        updated_state = {**updated_state, **node_state}
        await send(make_node_end(node_name))

        if node_name == "give_output":
            draft = updated_state.get("current_draft", "")
            await send(make_final_prompt(_strip_eval_markers(draft)))

    thread.join()
    return updated_state
