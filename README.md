# 범용 프롬프트 생성기

A web-based prompt generator powered by **LangGraph** and **Upstage Solar**. Input a rough idea and the AI produces a structured, high-quality 6-section prompt through an automated analysis → draft → evaluate → feedback loop.

![UI Preview](graph.png)

## Features

- **Split-panel UI** — conversation on the left, generated prompt on the right
- **Per-user API key** — each user enters their own Upstage API key; nothing is stored server-side
- **Real-time progress** — live step indicators as the graph executes
- **5-node LangGraph pipeline** — Analyze → Draft → Evaluate → Feedback → Output
- **One-click copy** — copy the final prompt to clipboard instantly

## How It Works

```
User Input
    │
    ▼
analyze_input  →  write_draft  →  evaluate
                      ▲               │
                      │         needs_improvement
                 agent_feedback        │
                                       ▼ good
                                  give_output
```

1. **analyze_input** — identifies missing information from the user's request
2. **write_draft** — generates a 6-section structured prompt
3. **evaluate** — scores the draft quality (good / needs_improvement)
4. **agent_feedback** — provides revision notes if quality is insufficient
5. **give_output** — delivers the final polished prompt

### 6-Section Prompt Template

| # | Section | Description |
|---|---------|-------------|
| 1 | 역할 (Role) | The AI's role and persona |
| 2 | 배경 정보 (Background) | Relevant context |
| 3 | 수행 과제 (Task) | What the AI must do |
| 4 | 제약 사항 (Constraints) | Rules and limitations |
| 5 | 세부 지시 (Instructions) | Step-by-step guidance |
| 6 | 출력 형식 (Output Format) | Expected output structure |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Upstage Solar Pro (`solar-pro`) |
| Agent framework | LangGraph |
| Backend | FastAPI + WebSocket |
| Frontend | Vanilla HTML / CSS / JS |
| Deployment | Docker + Railway |

## Getting Started

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (recommended) or pip
- Upstage API key — get one at [console.upstage.ai](https://console.upstage.ai)

### How to run

```bash
# Install dependencies
uv pip install -r requirements.txt

# Run
uv run uvicorn server.app:app --reload
```

Open `http://localhost:8000`, enter your Upstage API key, and start generating prompts.

### Environment Variable (optional)

If you want to skip the API key modal during local dev, create a `.env` file:

```
UPSTAGE_API_KEY=your_key_here
```

## Deployment on Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repository — Railway auto-detects the `Dockerfile`
4. Go to **Settings → Networking → Generate Domain**
5. Share the public URL with your team

No environment variables needed — each user provides their own API key via the UI.

## Project Structure

```
├── state.py              # LangGraph state definition
├── nodes.py              # Node functions (analyze, draft, evaluate, feedback, output)
├── graph.py              # Graph topology and conditional routing
├── main.py               # CLI entry point
├── server/
│   ├── app.py            # FastAPI app, routes, WebSocket endpoint
│   ├── session.py        # In-memory session store
│   ├── graph_runner.py   # Async graph execution with real-time streaming
│   └── ws_handler.py     # WebSocket message helpers
├── frontend/
│   ├── index.html        # Split-panel UI + API key modal
│   ├── style.css         # Light theme, minimal design
│   └── app.js            # WebSocket client, progress tracking
├── requirements.txt      # All dependencies
└── Dockerfile            # For Railway / Docker deployment
```

## License

MIT
