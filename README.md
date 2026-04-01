# LangGraph 기반 범용 프롬프트 생성기 🤖

**[English Version](./README.en.md)**

**LangGraph**와 **Upstage Solar Pro**를 활용하여 사용자의 아이디어를 고품질의 구조화된 프롬프트로 변환해주는 자동화 에이전트입니다. 체계적인 **분석 → 질문 → 초안 → 평가 → 출력** 파이프라인을 통해 누구나 쉽게 전문가급 프롬프트를 생성할 수 있도록 설계했습니다.

## 🚀 주요 특징

- **5단계 자동화 파이프라인**: 분석부터 출력까지 정형화된 워크플로우를 통해 프롬프트의 품질을 일관되게 유지합니다.
- **6섹션 표준 구조**: 역할, 배경, 과제, 제약 사항, 세부 지시, 출력 형식의 6가지 핵심 요소를 포함한 프롬프트를 생성합니다.
- **자가 수정 루프(Self-Correction)**: 작성된 초안을 AI가 직접 평가하고, 부족한 경우 최대 3회까지 자동으로 개선을 시도합니다.
- **듀얼 인터페이스 지원**: 전문가를 위한 빠른 **CLI 모드**와 직관적인 경험을 제공하는 **웹 UI**를 모두 지원합니다.
- **실시간 진행 스트리밍**: **FastAPI**와 **WebSocket**을 사용하여 에이전트의 사고 과정과 현재 단계를 실시간으로 시각화합니다.

## 🛠 기술 스택

- **AI 프레임워크**: LangGraph, LangChain
- **LLM**: Upstage Solar Pro
- **백엔드**: FastAPI, WebSocket
- **프론트엔드**: Vanilla JS, CSS3
- **DevOps**: Docker

## 🏗 프로젝트 구조

```text
├── main.py            # CLI 모드 진입점
├── graph.py           # LangGraph 파이프라인 및 워크플로우 정의
├── nodes.py           # 분석, 초안, 평가 등 각 노드의 비즈니스 로직
├── server/            # FastAPI 서버 및 WebSocket 통신 구현
└── frontend/          # 반응형 웹 인터페이스 및 상태 관리
```

## 🧠 핵심 기술 구현 내용

### 1. 상태 기반 멀티 노드 관리
LangGraph를 활용하여 각 단계(노드)가 `PromptState`라는 공통 상태를 기반으로 유기적으로 작동하도록 설계했습니다. 이를 통해 복잡한 분기 로직(정보 부족 시 질문, 품질 미달 시 재작성 등)을 안정적으로 처리합니다.

### 2. 품질 평가 및 자동 피드백 시스템
단순한 생성에 그치지 않고, `evaluate` 노드에서 생성된 초안의 명확성과 충실도를 검증합니다. 품질이 기준에 미달할 경우 상세한 피드백을 생성하고 이를 바탕으로 초안을 고도화하는 자가 개선 프로세스를 구현했습니다.

## 🏁 빠른 시작

### 사전 요구사항
- Python 3.9 이상
- [Upstage API Key](https://console.upstage.ai/)

### 웹 UI 실행
```bash
git clone <repository-url>
cd PromptGenerator_LangGraph
pip install -r requirements-web.txt
echo "UPSTAGE_API_KEY=your_key_here" > .env
uvicorn server.app:app --reload
```
`http://localhost:8000`에서 프롬프트를 생성할 수 있습니다.

### CLI 모드 실행
```bash
pip install -r requirements.txt
python main.py
```

> 💡 **더 자세한 정보가 필요하신가요?**
> 상세한 노드별(Node) 동작 로직 및 품질 평가(Evaluation) 루프의 구체적인 명세는 [상세 매뉴얼(DETAILS.md)](./DETAILS.md)에서 확인하실 수 있습니다.

---
LangGraph & Upstage Solar Pro로 구축한 프로젝트입니다.
