# Universal Prompt Generator (LangGraph) 🤖

**[한국어 버전](./README.md)**

A LangGraph-powered automated agent that transforms rough ideas into high-quality, structured prompts. Through a systematic **Analyze → Ask → Draft → Evaluate → Output** pipeline, it ensures every prompt follows a professional 6-section structure for optimal LLM performance.

## 🚀 Key Features

- **5-Stage Automation Pipeline**: A structured workflow (Analyze, Ask, Draft, Evaluate, Output) to guarantee consistent prompt quality.
- **6-Section Standardized Structure**: Generates prompts with dedicated sections for Role, Background, Task, Constraints, Instructions, and Format.
- **Self-Correction Loop**: Includes an automatic evaluation stage that iterates up to 3 times to refine the prompt draft.
- **Dual Mode Interface**: Supports both a fast **CLI mode** for power users and a **Web UI** for a more visual experience.
- **Real-time Streaming**: Powered by **FastAPI** and **WebSockets** to show the agent's progress and reasoning live.

## 🛠 Tech Stack

- **AI Framework**: LangGraph, LangChain
- **LLM**: Upstage Solar Pro
- **Backend**: FastAPI, WebSocket
- **Frontend**: Vanilla JS, CSS3
- **Deployment**: Docker

## 🏗 Project Structure

```text
├── main.py            # CLI entry point
├── graph.py           # LangGraph pipeline definition
├── nodes.py           # Logic for each pipeline stage
├── server/            # FastAPI & WebSocket implementation
└── frontend/          # Responsive web interface
```

## 🧠 Technical Highlights

### 1. Multi-Node State Management
I designed a state-based graph where each node (Analyze, Draft, etc.) performs a specific transformation on the `PromptState`. This modular approach makes it easy to debug and expand the pipeline's capabilities.

### 2. Automatic Quality Evaluation
The agent doesn't just write a prompt; it critiques it. The `evaluate` node checks the draft against predefined quality standards and can trigger a re-write (up to 3 times) if the prompt is vague or incomplete.

## 🏁 Quick Start

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

---
Built with ❤️ using LangGraph & Upstage Solar.
