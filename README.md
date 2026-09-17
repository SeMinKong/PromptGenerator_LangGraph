# LangGraph 기반 범용 프롬프트 생성기

**[English Version](./README.en.md)**

사용자의 아이디어를 받아 구조화된 프롬프트로 정리하는 도구입니다. **LangGraph**로 **분석 → 질문 → 초안 → 평가 → 출력** 단계를 연결하고, **Upstage Solar Pro**로 각 단계를 처리합니다.

## 주요 특징

<img width="323" height="531" alt="graph" src="https://github.com/user-attachments/assets/37f42a42-31d2-410d-9374-03d580adf623" />

- **5단계 파이프라인**: 분석, 질문, 초안, 평가, 출력을 각각 LangGraph 노드로 나눴습니다.
- **6개 섹션**: 역할, 배경, 과제, 제약 사항, 세부 지시, 출력 형식으로 결과를 구성합니다.
- **수정 루프**: 평가 결과가 기준에 미달하면 초안을 최대 3회 다시 작성합니다.
- **두 가지 실행 방식**: CLI와 웹 UI를 모두 사용할 수 있습니다.
- **진행 상태 표시**: **FastAPI**와 **WebSocket**으로 현재 처리 단계를 웹 화면에 전달합니다.

## 기술 스택

- **AI 프레임워크**: LangGraph, LangChain
- **LLM**: Upstage Solar Pro
- **백엔드**: FastAPI, WebSocket
- **프론트엔드**: Vanilla JS, CSS3
- **DevOps**: Docker

## 프로젝트 구조

```text
├── main.py            # CLI 모드 진입점
├── graph.py           # LangGraph 파이프라인 및 워크플로우 정의
├── nodes.py           # 분석, 초안, 평가 등 각 노드의 비즈니스 로직
├── server/            # FastAPI 서버 및 WebSocket 통신 구현
└── frontend/          # 반응형 웹 인터페이스 및 상태 관리
```

## 핵심 기술 구현 내용

### 1. 상태 기반 멀티 노드 관리
각 노드는 `PromptState`를 읽고 갱신합니다. 정보가 부족하면 질문 단계로, 평가 기준에 미달하면 재작성 단계로 이동하도록 분기했습니다.

### 2. 품질 평가 및 자동 피드백 시스템
`evaluate` 노드에서 초안의 명확성과 충실도를 확인합니다. 기준에 미달하면 피드백과 함께 초안 단계로 돌아가며, 이 과정은 최대 3회 반복됩니다.

## 빠른 시작

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

노드별 동작과 평가 루프는 [상세 매뉴얼](./DETAILS.md)에 정리했습니다.
