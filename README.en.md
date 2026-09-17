# Universal Prompt Generator (LangGraph)

**[한국어 버전](./README.md)**

I built this tool to turn a rough idea into a structured prompt. LangGraph connects the **Analyze → Ask → Draft → Evaluate → Output** stages, and Upstage Solar Pro handles each stage.

## Key Features

- **Five stages**: Analyze, Ask, Draft, Evaluate, and Output are separate LangGraph nodes.
- **Six output sections**: Role, Background, Task, Constraints, Instructions, and Format.
- **Revision loop**: If evaluation fails, the draft is rewritten up to three times.
- **Two interfaces**: The project can run through either the CLI or the web UI.
- **Progress updates**: **FastAPI** and **WebSocket** send the current stage to the browser.

## Tech Stack

- **AI Framework**: LangGraph, LangChain
- **LLM**: Upstage Solar Pro
- **Backend**: FastAPI, WebSocket
- **Frontend**: Vanilla JS, CSS3
- **Deployment**: Docker

## Project Structure

```text
├── main.py            # CLI entry point
├── graph.py           # LangGraph pipeline definition
├── nodes.py           # Logic for each pipeline stage
├── server/            # FastAPI & WebSocket implementation
└── frontend/          # Responsive web interface
```

## Technical Highlights

### 1. Multi-Node State Management
Each node reads and updates `PromptState`. The graph moves to the question stage when information is missing and returns to drafting when evaluation fails.

### 2. Automatic Quality Evaluation
The `evaluate` node checks the draft against predefined criteria. If the draft is vague or incomplete, it returns feedback and sends the state back for another draft, up to three times.

## Quick Start

### Prerequisites
- Python 3.9+
- [Upstage API Key](https://console.upstage.ai/)

### Installation & Run (Web UI)
```bash
git clone <repository-url>
cd PromptGenerator_LangGraph
pip install -r requirements-web.txt
echo "UPSTAGE_API_KEY=your_key_here" > .env
uvicorn server.app:app --reload
```
Open `http://localhost:8000` to start generating prompts.

### Run (CLI Mode)
```bash
pip install -r requirements.txt
python main.py
```

Node functions, the TypedDict state, and evaluation rules are documented in the [detailed manual](./DETAILS.en.md).
