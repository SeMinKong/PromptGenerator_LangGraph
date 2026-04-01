# 범용 프롬프트 생성기 | Universal Prompt Generator

<div align="center">

LangGraph 기반의 자동화된 프롬프트 생성 에이전트

Automated Prompt Generation Agent powered by LangGraph

</div>

---

## 한국어 (Korean)

### 프로젝트 개요

**범용 프롬프트 생성기**는 LangGraph 기반의 자동화된 에이전트로, 사용자가 원하는 프롬프트의 대략적인 아이디어를 입력하면 AI가 **분석 → 질문 → 초안 → 평가 → 출력**의 5단계 파이프라인을 통해 체계적이고 고품질의 **6섹션 구조 프롬프트**를 자동으로 생성합니다.

**6섹션 구조:**
1. **역할 (Role)** - AI가 수행할 역할
2. **배경 정보 (Background Information)** - 관련 컨텍스트
3. **수행 과제 (Task to Perform)** - 구체적인 작업
4. **제약 사항 (Constraints)** - 제한사항 및 규칙
5. **세부 지시 (Detailed Instructions)** - 단계별 가이드
6. **출력 형식 (Output Format)** - 기대하는 결과 형식

### 핵심 기능

- **LangGraph 기반 멀티 노드 에이전트** - 구조화된 파이프라인으로 일관된 품질 보장
- **실시간 진행 상황 표시** - WebSocket 스트리밍을 통한 라이브 업데이트
- **사용자별 API 키 관리** - 각 세션별로 독립적인 API 키 관리 (서버 저장 없음)
- **자동 품질 평가 루프** - 최대 3회 개선 사이클
- **CLI 모드 & 웹 UI** - 터미널 또는 브라우저에서 사용 가능
- **한글 완벽 지원** - 입출력 모두 한국어 최적화

### 기술 스택

| 레이어 | 기술 | 설명 |
|--------|------|------|
| **LLM** | Upstage Solar Pro (`solar-pro`) | 한국어 최적화 모델 |
| **에이전트 프레임워크** | LangGraph 0.2+ | 상태 기반 그래프 관리 |
| **백엔드 서버** | FastAPI 0.110+ | 비동기 웹 프레임워크 |
| **실시간 통신** | WebSocket | 클라이언트-서버 스트리밍 |
| **프론트엔드** | HTML / CSS / JavaScript (바닐라) | 외부 의존성 없음 |
| **배포** | Docker | 컨테이너화 배포 |

---

## 사용자 가이드

### CLI 모드 사용법

#### 설치

```bash
# 저장소 복제
git clone https://github.com/SeMinKong/langgraph.git
cd PromptGenerator_LangGraph

# 의존성 설치
pip install -r requirements.txt

# 또는 uv 사용
uv pip install -r requirements.txt
```

#### 환경 설정

`.env` 파일을 프로젝트 루트에 생성하고 API 키를 입력하세요:

```bash
UPSTAGE_API_KEY=up_xxxxxxxxxxxxxxxxxxxxx
```

#### 실행

```bash
python main.py
```

#### 사용 흐름

프로그램 실행 후 아래와 같은 대화형 흐름을 따릅니다:

```
============================================================
  범용 프롬프트 생성기 (Universal Prompt Generator)
  Powered by LangGraph + Upstage Solar
  종료하려면 'quit' 또는 'exit'를 입력하세요.
============================================================

어떤 용도의 프롬프트를 만들어 드릴까요? 원하시는 내용을 입력해 주세요.

You: 영어로 된 기술 블로그 포스트를 작성해주는 프롬프트가 필요해요
```

**단계 1: 분석 (analyze_input)**
- AI가 사용자 입력을 분석합니다
- 6개 섹션 중 어떤 정보가 부족한지 판단합니다

**단계 2: 정보 요청 (ask_user)** - 필요시
- 부족한 정보에 대해 구체적으로 질문합니다

```
Agent: 좋은 프롬프트를 작성하기 위해 다음 정보가 더 필요합니다:

- 수행 과제 (목표 독자층, 블로그 주제)
- 제약 사항 (길이 제한, 기술 수준)

위 항목들에 대해 알려주세요.
```

**단계 3: 초안 작성 (write_draft)**
- 수집된 정보를 바탕으로 6섹션 구조의 초안을 작성합니다

**단계 4: 평가 (evaluate)**
- 작성된 초안의 품질을 평가합니다
- 필요시 다시 write_draft로 돌아가 개선합니다 (최대 3회)

**단계 5: 출력 (give_output)**
- 최종 프롬프트를 사용자에게 전달합니다

```
============================================================
최종 프롬프트가 완성되었습니다!
============================================================

## 역할 (Role)
당신은 기술 입문자를 대상으로 하는 전문 블로그 라이터입니다.

## 배경 정보 (Background Information)
AI 기술은 빠르게 발전하고 있으며, 많은 초보자들이 이 분야의 기초를 이해하고 싶어합니다.

## 수행 과제 (Task to Perform)
AI와 머신러닝의 기초 개념을 설명하는 2000단어 규모의 기술 블로그 포스트를 작성합니다.

## 제약 사항 (Constraints)
- 포스트는 2000단어 내외로 작성
- 기술 용어는 최대한 쉽게 설명
- 실제 예제를 포함

## 세부 지시 (Detailed Instructions)
1. 인트로 작성 (150-200단어)
2. 기본 개념 설명 (500-600단어)
3. 실제 응용 사례 (500-600단어)
4. 결론 및 다음 단계 (200-250단어)

## 출력 형식 (Output Format)
마크다운 형식의 블로그 포스트
```

**단계 6: 새 프롬프트 생성**
- 완료 후 자동으로 상태가 초기화되어 새로운 프롬프트 생성을 시작할 수 있습니다

#### 종료

```bash
You: quit
# 또는
You: exit
# 또는
You: 종료
```

---

### 웹 UI 모드 사용법

#### 설치 및 실행

```bash
# 웹 모드용 의존성 설치
pip install -r requirements-web.txt

# FastAPI 서버 실행
uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload

# 브라우저에서 접속
# http://localhost:8000
```

#### 웹 인터페이스 사용법

1. **API 키 입력**
   - 페이지 로드 시 모달 창에서 Upstage API 키를 입력합니다
   - 키는 브라우저 메모리에만 저장되며 서버에 전송되지 않습니다

2. **프롬프트 작성**
   - 좌측 패널의 입력창에 원하는 프롬프트 설명을 입력합니다
   - "전송" 버튼 또는 Enter 키로 제출합니다

3. **실시간 진행 표시**
   - 상단 진행 표시줄에서 현재 단계를 실시간으로 확인합니다
   - 각 단계별 소요 시간을 표시합니다

4. **생성된 프롬프트 확인**
   - 우측 패널에서 완성된 프롬프트를 확인합니다
   - 마크다운 형식으로 렌더링됩니다

5. **새 세션 시작**
   - 우상단 "새 세션" 버튼으로 상태를 초기화하고 새로운 프롬프트를 생성합니다

#### 웹 인터페이스 상태 표시

| 상태 | 의미 |
|------|------|
| 🟡 연결 중 | WebSocket 연결 설정 중 |
| 🟢 연결됨 | WebSocket 정상 연결 |
| 🔴 연결 끊김 | WebSocket 연결 실패 또는 종료 |

#### 진행 단계 표시

상단 진행 표시줄에서 다음 5개 단계를 확인할 수 있습니다:

| 단계 | 한글 | 설명 |
|------|------|------|
| 1️⃣ | 분석 | 사용자 입력 분석 중 |
| 2️⃣ | 정보 요청 | 추가 정보 요청 (필요시) |
| 3️⃣ | 초안 작성 | 6섹션 프롬프트 초안 작성 중 |
| 4️⃣ | 평가 | 초안 품질 평가 중 |
| 5️⃣ | 완성 | 최종 프롬프트 완성 |

---

## 개발자 가이드

### 필수 사항

- Python 3.9+
- Upstage API 키 (https://console.upstage.ai/)
- pip 또는 uv 패키지 관리자

### 설치

#### CLI 전용 모드

기본 프롬프트 생성 기능만 필요한 경우:

```bash
pip install -r requirements.txt
```

**requirements.txt 포함 라이브러리:**
- `fastapi>=0.110.0` - 웹 프레임워크 (상태 관리 용도)
- `uvicorn[standard]>=0.29.0` - ASGI 서버
- `websockets>=12.0` - 웹소켓 지원
- `python-multipart>=0.0.9` - 폼 데이터 처리
- `langgraph>=0.2.0` - 에이전트 상태 그래프
- `langchain-core>=0.2.0` - LLM 메시지 기본 클래스
- `langchain-upstage>=0.1.0` - Upstage LLM 통합
- `python-dotenv>=1.0.0` - 환경 변수 관리

#### 웹 UI 모드

웹 인터페이스가 필요한 경우:

```bash
pip install -r requirements-web.txt
```

**requirements-web.txt 포함 라이브러리:**
- `fastapi>=0.110.0` - 웹 프레임워크
- `uvicorn[standard]>=0.29.0` - ASGI 서버
- `websockets>=12.0` - 웹소켓
- `python-multipart>=0.0.9` - 폼 데이터

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# Upstage API 키 (필수)
UPSTAGE_API_KEY=up_xxxxxxxxxxxxxxxxxxxxx
```

**참고:**
- CLI 모드에서는 .env 파일이 선택사항입니다 (웹 UI에서 런타임에 입력 가능)
- 웹 UI에서 입력한 키는 서버에 저장되지 않으며, 브라우저 세션 메모리에만 임시 저장됩니다

### 실행 명령어

#### CLI 모드

```bash
python main.py
```

#### 웹 UI 모드 (개발 환경)

```bash
uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload
```

#### 웹 UI 모드 (프로덕션 환경)

```bash
uvicorn server.app:app --host 0.0.0.0 --port 8000 --workers 4
```

---

### 프로젝트 구조

```
PromptGenerator_LangGraph/
├── main.py                    # CLI 진입점 (대화형 프롬프트 생성)
├── graph.py                   # LangGraph 파이프라인 정의
├── nodes.py                   # 각 노드 구현 (분석, 질문, 초안, 평가, 출력)
├── state.py                   # 상태 TypedDict 정의
├── requirements.txt           # Python 의존성 (CLI + 기본 요구사항)
├── requirements-web.txt       # 웹 서버 추가 의존성
├── Dockerfile                 # Docker 배포 설정
│
├── server/                    # 웹 서버 모듈
│   ├── __init__.py
│   ├── app.py                 # FastAPI 애플리케이션 (엔드포인트 정의)
│   ├── graph_runner.py        # LangGraph 스트리밍 실행기
│   ├── session.py             # 세션 스토어 (메모리 기반)
│   └── ws_handler.py          # WebSocket 메시지 프로토콜
│
├── frontend/                  # 프론트엔드 코드
│   ├── index.html             # HTML 페이지
│   ├── app.js                 # JavaScript 클라이언트
│   └── style.css              # CSS 스타일
│
└── graph.png                  # LangGraph 파이프라인 시각화
```

---

### LangGraph 노드 상세 설명

#### 1. **analyze_input** 노드

**목적:** 사용자 입력을 분석하여 6개 섹션 중 어떤 정보가 부족한지 판단

**입력:**
- `messages`: 지금까지의 대화 내역

**출력:**
- `missing_info`: 부족한 정보 항목 리스트

**동작:**
```python
def analyze_input(state: PromptState) -> PromptState:
    """
    LLM에 시스템 프롬프트와 함께 대화 내역을 전달
    LLM이 JSON 형식으로 응답: {"missing": ["항목1", "항목2", ...]}
    """
```

**라우팅:**
- `missing_info`가 비어있으면 → `write_draft`로 진행
- `missing_info`에 항목이 있으면 → `ask_user`로 진행

---

#### 2. **ask_user** 노드

**목적:** 부족한 정보에 대해 사용자에게 구체적으로 질문

**입력:**
- `missing_info`: 부족한 항목 리스트

**출력:**
- `messages`: AI 질문 메시지 추가

**동작:**
```python
def ask_user(state: PromptState) -> PromptState:
    """
    missing_info 리스트를 읽기 쉬운 질문 형식으로 변환
    예: "다음 정보가 더 필요합니다:\n- 역할\n- 제약 사항\n위 항목들에 대해 알려주세요."
    """
```

**라우팅:**
- 자동으로 END로 진행 (사용자 입력 대기)
- 사용자가 응답하면 다시 `analyze_input`으로 돌아감

---

#### 3. **write_draft** 노드

**목적:** 수집된 정보를 바탕으로 6섹션 프롬프트 초안 작성

**입력:**
- `messages`: 전체 대화 내역

**출력:**
- `current_draft`: 생성된 프롬프트 텍스트

**동작:**
```python
def write_draft(state: PromptState) -> PromptState:
    """
    LLM에 6개 섹션 템플릿을 지정하여 프롬프트 생성 요청
    Upstage Solar Pro가 각 섹션을 충실하게 작성
    정보가 부족한 경우에도 맥락상 합리적인 가정을 통해 작성
    """
```

**라우팅:**
- 자동으로 `evaluate`로 진행

---

#### 4. **evaluate** 노드

**목적:** 작성된 초안의 품질을 평가하고 개선이 필요한지 판단

**입력:**
- `current_draft`: 평가할 프롬프트 텍스트

**출력:**
- `current_draft`: 평가 결과 마크 추가 (`<!-- eval:good -->` 또는 `<!-- eval:needs_improvement -->`)
- `messages`: 평가 결과 및 피드백 메시지 추가
- `revision_count`: 개선 횟수 카운트 증가

**동작:**
```python
def evaluate(state: PromptState) -> PromptState:
    """
    LLM에 초안을 전달하여 품질 평가
    응답 형식: {"quality": "good" or "needs_improvement", "reason": "...", "feedback": "..."}
    
    - quality="good": 6개 섹션이 모두 충실하고 명확함
    - quality="needs_improvement": 섹션 누락, 모호함, 불완전함
    """
```

**라우팅:**
- `revision_count >= MAX_REVISIONS (3)` → `give_output`로 강제 진행
- 평가가 "good" → `give_output`으로 진행
- 평가가 "needs_improvement" → `write_draft`로 돌아가 개선

---

#### 5. **give_output** 노드

**목적:** 최종 프롬프트를 사용자에게 전달하기 위해 정리

**입력:**
- `current_draft`: 최종 프롬프트 (평가 마크 포함)

**출력:**
- `current_draft`: 평가 마크 제거된 정제된 프롬프트
- `messages`: 최종 출력 메시지 추가

**동작:**
```python
def give_output(state: PromptState) -> PromptState:
    """
    current_draft에서 <!-- eval:xxx --> 마크 제거
    최종 프롬프트를 명확하게 포맷팅하여 출력
    """
```

**라우팅:**
- 자동으로 END로 진행 (파이프라인 완료)

---

### 상태 (State) TypedDict

```python
class PromptState(TypedDict):
    messages: Annotated[list, add_messages]
    # LangChain 메시지 리스트
    # HumanMessage, AIMessage 등 포함
    # add_messages reducer를 통해 중복 제거 및 순서 유지
    
    missing_info: list[str]
    # analyze_input이 판단한 부족한 정보 항목들
    # 예: ["역할", "제약 사항"]
    
    current_draft: str
    # 작성 중 또는 완성된 프롬프트 텍스트
    # 평가 단계에서는 <!-- eval:xxx --> 마크를 포함
    
    api_key: str
    # 세션별 Upstage API 키
    # CLI 모드: .env 또는 시작 시 로드
    # 웹 UI: 사용자가 입력, 브라우저 메모리에만 저장
    
    revision_count: int
    # 개선 루프 횟수 (0부터 시작)
    # MAX_REVISIONS(3)에 도달하면 강제로 give_output으로 진행
```

---

### 평가 루프 (Evaluation Loop) 상세

프로젝트는 **최대 3회 자동 개선 시스템**을 포함합니다.

**흐름:**
```
write_draft → evaluate
    ↓
quality="good"?
    YES → give_output (완료)
    NO  → revision_count < MAX_REVISIONS (3)?
        YES → write_draft (개선)
        NO  → give_output (강제 완료)
```

**MAX_REVISIONS 설정:**
- 파일: `graph.py`
- 값: `MAX_REVISIONS = 3`
- 의미: 최대 3번까지 자동 개선 시도

**개선 과정에서의 피드백:**
- `evaluate` 노드는 "good"이 아닐 경우 상세한 피드백 제공
- `write_draft`는 이 피드백을 대화 내역에 포함시켜 개선된 초안 작성
- 사용자는 웹 UI에서 각 개선 단계와 피드백을 실시간으로 확인 가능

---

### WebSocket 통신 프로토콜

웹 UI는 WebSocket을 통해 실시간 통신합니다.

#### 클라이언트 → 서버 메시지

```json
{
  "type": "user_message",
  "content": "사용자가 입력한 텍스트"
}
```

```json
{
  "type": "reset"
}
```

#### 서버 → 클라이언트 메시지

**노드 시작 (node_start):**
```json
{
  "type": "node_start",
  "node": "write_draft",
  "revision": 0,
  "max_revisions": 3
}
```

**노드 완료 (node_end):**
```json
{
  "type": "node_end",
  "node": "evaluate"
}
```

**AI 메시지 (ai_message):**
```json
{
  "type": "ai_message",
  "content": "AI가 생성한 텍스트 (질문, 평가, 피드백 등)"
}
```

**최종 프롬프트 (final_prompt):**
```json
{
  "type": "final_prompt",
  "content": "## 역할 (Role)\n...\n## 배경 정보\n..."
}
```

**에러 (error):**
```json
{
  "type": "error",
  "message": "오류 설명"
}
```

**세션 초기화 (session_reset):**
```json
{
  "type": "session_reset"
}
```

---

### Docker 배포

#### Dockerfile 상세

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**특징:**
- Python 3.11 slim 이미지 사용 (경량화)
- 멀티스테이지 빌드 미사용 (간단한 구조 유지)
- 포트 8000 노출 (FastAPI 기본 포트)

#### 빌드 및 실행

```bash
# Docker 이미지 빌드
docker build -t prompt-generator:latest .

# 컨테이너 실행 (환경 변수 전달)
docker run -d \
  -p 8000:8000 \
  -e UPSTAGE_API_KEY=up_xxxxx \
  prompt-generator:latest

# 컨테이너 실행 (프로덕션)
docker run -d \
  -p 8000:8000 \
  -e UPSTAGE_API_KEY=up_xxxxx \
  --restart unless-stopped \
  prompt-generator:latest
```

#### 환경 변수 전달 (Docker Compose)

```yaml
version: '3.8'

services:
  prompt-generator:
    build: .
    ports:
      - "8000:8000"
    environment:
      - UPSTAGE_API_KEY=${UPSTAGE_API_KEY}
    restart: unless-stopped
```

```bash
# 실행
UPSTAGE_API_KEY=up_xxxxx docker-compose up -d
```

---

### ProjectPromptGenerator_LangGraph vs PromptGenerator_LangGraph

같은 저장소에 두 개의 유사한 프로젝트가 존재합니다. 주요 차이점:

| 항목 | ProjectPromptGenerator | PromptGenerator |
|------|------------------------|-----------------|
| **파이프라인** | 더 복잡한 단계 | 5단계 (분석→질문→초안→평가→출력) |
| **평가 루프** | 최대 5회 개선 | 최대 3회 개선 |
| **코드 구조** | 더 큰 파일, 많은 기능 | 간결하고 모듈화된 구조 |
| **초점** | 포괄적인 프롬프트 엔지니어링 | 빠른 프로토타이핑 및 학습 |
| **추천 용도** | 프로덕션 환경 | 개발, 실험, 맞춤화 |

**언제 어떤 것을 사용할지:**
- **PromptGenerator_LangGraph** - 빠르게 시작하고 싶거나, LangGraph를 학습하고 싶을 때
- **ProjectPromptGenerator_LangGraph** - 엔터프라이즈급 프롬프트 생성이 필요할 때

---

### 개발 팁

#### 1. LLM 응답 디버깅

`nodes.py`의 `_parse_json_response` 함수는 LLM의 JSON 파싱 실패를 로깅합니다:

```python
logger.debug("JSON parse failed: %s | raw content: %.200s", exc, content)
```

로깅 레벨을 DEBUG로 설정하면 원본 응답을 확인할 수 있습니다:

```python
logging.basicConfig(level=logging.DEBUG)
```

#### 2. 상태 검사 (CLI 모드)

`main.py`를 실행할 때 각 단계 후 상태를 확인하려면:

```python
# main.py의 graph 실행 후
print(f"Current state: {state}")
```

#### 3. 웹 UI 디버깅

브라우저 개발자 도구 (F12) → Network 탭에서:
- WebSocket 연결 확인
- 메시지 송수신 패턴 모니터링
- 서버 응답 시간 측정

#### 4. API 키 문제 해결

```bash
# CLI에서 API 키 검증
python -c "
from nodes import _get_llm
from langchain_core.messages import HumanMessage

llm = _get_llm('your_api_key')
response = llm.invoke([HumanMessage(content='hi')])
print('API key is valid!')
"
```

---

## English

### Project Overview

**Universal Prompt Generator** is an automated agent powered by LangGraph that transforms rough ideas into structured, high-quality **6-section prompts** through a 5-stage pipeline: **analyze → ask → draft → evaluate → output**.

**6-Section Structure:**
1. **Role** - The AI's role
2. **Background Information** - Relevant context
3. **Task to Perform** - Specific work to do
4. **Constraints** - Limitations and rules
5. **Detailed Instructions** - Step-by-step guidance
6. **Output Format** - Expected result format

### Key Features

- **LangGraph-based multi-node agent** - Structured pipeline for consistent quality
- **Real-time progress streaming** - Live updates via WebSocket
- **Per-session API key management** - Independent key per session (not stored on server)
- **Automatic quality evaluation loop** - Up to 3 improvement cycles
- **CLI & Web UI modes** - Use from terminal or browser
- **Full Korean support** - Input/output optimized for Korean language

### Tech Stack

| Layer | Technology | Description |
|-------|-----------|-------------|
| **LLM** | Upstage Solar Pro (`solar-pro`) | Korean-optimized model |
| **Agent Framework** | LangGraph 0.2+ | State-based graph management |
| **Backend Server** | FastAPI 0.110+ | Async web framework |
| **Real-time Messaging** | WebSocket | Client-server streaming |
| **Frontend** | HTML / CSS / JavaScript (vanilla) | No external dependencies |
| **Deployment** | Docker | Containerized deployment |

---

## User Guide

### CLI Mode

#### Installation

```bash
# Clone repository
git clone https://github.com/SeMinKong/langgraph.git
cd PromptGenerator_LangGraph

# Install dependencies
pip install -r requirements.txt

# Or using uv
uv pip install -r requirements.txt
```

#### Setup

Create a `.env` file in the project root:

```bash
UPSTAGE_API_KEY=up_xxxxxxxxxxxxxxxxxxxxx
```

#### Running

```bash
python main.py
```

#### Usage Flow

After running the program, follow this interactive conversation:

```
============================================================
  Universal Prompt Generator
  Powered by LangGraph + Upstage Solar
  Type 'quit' or 'exit' to exit.
============================================================

What kind of prompt would you like to create? Please describe your idea.

You: I need a prompt that writes technical blog posts in English
```

**Step 1: Analyze (analyze_input)**
- AI analyzes user input
- Determines which information is missing from the 6 sections

**Step 2: Ask User (ask_user)** - If needed
- AI asks specific questions about missing information

```
Agent: Good prompts require the following information:

- Task to Perform (target audience, blog topic)
- Constraints (length limit, technical level)

Please provide details for these items.
```

**Step 3: Draft (write_draft)**
- Creates a 6-section prompt draft based on collected information

**Step 4: Evaluate (evaluate)**
- Evaluates draft quality
- If needed, returns to write_draft for improvement (max 3 times)

**Step 5: Output (give_output)**
- Delivers the final prompt

```
============================================================
Final prompt has been created!
============================================================

## Role
You are a professional blog writer for technical beginners.

## Background Information
AI technology is evolving rapidly, and many beginners want to understand the basics.

## Task to Perform
Write a ~2000-word technical blog post explaining AI and machine learning fundamentals.

## Constraints
- Post should be approximately 2000 words
- Explain technical terms in simple language
- Include real-world examples

## Detailed Instructions
1. Write introduction (150-200 words)
2. Explain basic concepts (500-600 words)
3. Provide real-world applications (500-600 words)
4. Conclusion and next steps (200-250 words)

## Output Format
Blog post in markdown format
```

**Step 6: New Prompt**
- After completion, state automatically resets for creating a new prompt

#### Exit

```bash
You: quit
# or
You: exit
```

---

### Web UI Mode

#### Installation & Running

```bash
# Install web dependencies
pip install -r requirements-web.txt

# Run FastAPI server
uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload

# Open browser
# http://localhost:8000
```

#### Using the Web Interface

1. **Enter API Key**
   - Modal appears on page load
   - Enter your Upstage API key
   - Key is stored only in browser memory (not sent to server)

2. **Create Prompt**
   - Enter your prompt description in the left panel
   - Click "Send" or press Enter

3. **Real-time Progress**
   - Top progress bar shows current stage in real-time
   - Each stage displays elapsed time

4. **View Generated Prompt**
   - Right panel shows completed prompt
   - Rendered as markdown

5. **Start New Session**
   - Click "New Session" button (top right) to reset and create another prompt

#### Web Interface Status

| Status | Meaning |
|--------|---------|
| 🟡 Connecting | Setting up WebSocket |
| 🟢 Connected | WebSocket ready |
| 🔴 Disconnected | Connection failed |

#### Pipeline Stages

Top progress bar displays 5 stages:

| Stage | Name | Description |
|-------|------|-------------|
| 1️⃣ | Analyze | Analyzing user input |
| 2️⃣ | Ask User | Requesting additional info (if needed) |
| 3️⃣ | Draft | Writing 6-section prompt |
| 4️⃣ | Evaluate | Assessing quality |
| 5️⃣ | Output | Finalizing prompt |

---

## Developer Guide

### Requirements

- Python 3.9+
- Upstage API key (https://console.upstage.ai/)
- pip or uv package manager

### Installation

#### CLI-only Mode

```bash
pip install -r requirements.txt
```

**requirements.txt includes:**
- `fastapi>=0.110.0` - Web framework
- `uvicorn[standard]>=0.29.0` - ASGI server
- `websockets>=12.0` - WebSocket support
- `python-multipart>=0.0.9` - Form data handling
- `langgraph>=0.2.0` - Agent state graph
- `langchain-core>=0.2.0` - LLM message base classes
- `langchain-upstage>=0.1.0` - Upstage LLM integration
- `python-dotenv>=1.0.0` - Environment variable management

#### Web UI Mode

```bash
pip install -r requirements-web.txt
```

**requirements-web.txt includes:**
- `fastapi>=0.110.0` - Web framework
- `uvicorn[standard]>=0.29.0` - ASGI server
- `websockets>=12.0` - WebSocket support
- `python-multipart>=0.0.9` - Form data handling

### Environment Variables

Create a `.env` file:

```env
# Upstage API Key (optional for CLI if provided at runtime)
UPSTAGE_API_KEY=up_xxxxxxxxxxxxxxxxxxxxx
```

**Note:**
- CLI mode: .env file is optional (can be loaded at runtime)
- Web UI: Keys are entered at runtime, never stored on server

### Commands

#### CLI Mode

```bash
python main.py
```

#### Web UI Mode (Development)

```bash
uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload
```

#### Web UI Mode (Production)

```bash
uvicorn server.app:app --host 0.0.0.0 --port 8000 --workers 4
```

---

### Project Structure

```
PromptGenerator_LangGraph/
├── main.py                    # CLI entry point
├── graph.py                   # LangGraph pipeline definition
├── nodes.py                   # Node implementations
├── state.py                   # State TypedDict definition
├── requirements.txt           # Python dependencies
├── requirements-web.txt       # Web server dependencies
├── Dockerfile                 # Docker deployment config
│
├── server/                    # Web server module
│   ├── __init__.py
│   ├── app.py                 # FastAPI application
│   ├── graph_runner.py        # LangGraph streaming executor
│   ├── session.py             # Session store (in-memory)
│   └── ws_handler.py          # WebSocket message protocol
│
├── frontend/                  # Frontend code
│   ├── index.html             # HTML page
│   ├── app.js                 # JavaScript client
│   └── style.css              # CSS styling
│
└── graph.png                  # Pipeline visualization
```

---

### LangGraph Nodes Explained

#### 1. **analyze_input** Node

**Purpose:** Analyze user input to determine which 6-section information is missing

**Input:**
- `messages`: Conversation history

**Output:**
- `missing_info`: List of missing information items

**Implementation:**
```python
def analyze_input(state: PromptState) -> PromptState:
    """
    Sends conversation to LLM with system prompt
    LLM responds with JSON: {"missing": ["item1", "item2", ...]}
    """
```

**Routing:**
- `missing_info` empty → goes to `write_draft`
- `missing_info` has items → goes to `ask_user`

---

#### 2. **ask_user** Node

**Purpose:** Generate specific questions for missing information

**Input:**
- `missing_info`: List of missing items

**Output:**
- `messages`: AI question added to conversation

**Implementation:**
```python
def ask_user(state: PromptState) -> PromptState:
    """
    Converts missing_info into readable question format
    Appends as AIMessage to messages
    """
```

**Routing:**
- Automatically goes to END (waits for user input)
- User responds → returns to `analyze_input`

---

#### 3. **write_draft** Node

**Purpose:** Create 6-section prompt draft from collected information

**Input:**
- `messages`: Full conversation history

**Output:**
- `current_draft`: Generated prompt text

**Implementation:**
```python
def write_draft(state: PromptState) -> PromptState:
    """
    Sends conversation to LLM with 6-section template
    LLM fills each section based on collected information
    Makes reasonable assumptions for missing details
    """
```

**Routing:**
- Automatically goes to `evaluate`

---

#### 4. **evaluate** Node

**Purpose:** Assess draft quality and determine if improvement is needed

**Input:**
- `current_draft`: Prompt to evaluate

**Output:**
- `current_draft`: Draft with eval marker (`<!-- eval:good -->` or `<!-- eval:needs_improvement -->`)
- `messages`: Evaluation result and feedback
- `revision_count`: Increment improvement count

**Implementation:**
```python
def evaluate(state: PromptState) -> PromptState:
    """
    Sends draft to LLM for quality assessment
    Response format: {"quality": "good"|"needs_improvement", "reason": "...", "feedback": "..."}
    
    - quality="good": All sections present, detailed, coherent
    - quality="needs_improvement": Missing sections, vague, or incomplete
    """
```

**Routing:**
- `revision_count >= MAX_REVISIONS (3)` → forces `give_output`
- Quality="good" → goes to `give_output`
- Quality="needs_improvement" → returns to `write_draft`

---

#### 5. **give_output** Node

**Purpose:** Finalize and deliver the prompt to user

**Input:**
- `current_draft`: Final prompt (with eval markers)

**Output:**
- `current_draft`: Cleaned prompt (eval markers removed)
- `messages`: Final output message added

**Implementation:**
```python
def give_output(state: PromptState) -> PromptState:
    """
    Removes evaluation markers from draft
    Formats final prompt for user
    Marks pipeline as complete
    """
```

**Routing:**
- Automatically goes to END (pipeline complete)

---

### State TypedDict

```python
class PromptState(TypedDict):
    messages: Annotated[list, add_messages]
    # List of LangChain Message objects
    # Includes HumanMessage, AIMessage
    # add_messages reducer deduplicates and maintains order
    
    missing_info: list[str]
    # Items identified as missing by analyze_input
    # Example: ["role", "constraints"]
    
    current_draft: str
    # In-progress or completed prompt text
    # During evaluation: includes <!-- eval:xxx --> markers
    
    api_key: str
    # Per-session Upstage API key
    # CLI: loaded from .env
    # Web UI: provided by user at runtime
    
    revision_count: int
    # Number of improvement iterations (starts at 0)
    # When MAX_REVISIONS(3) is reached, forces give_output
```

---

### Evaluation Loop

The project includes an **automatic 3-cycle improvement system**.

**Flow:**
```
write_draft → evaluate
    ↓
quality="good"?
    YES → give_output (done)
    NO  → revision_count < MAX_REVISIONS (3)?
        YES → write_draft (improve)
        NO  → give_output (force end)
```

**MAX_REVISIONS Configuration:**
- File: `graph.py`
- Value: `MAX_REVISIONS = 3`
- Meaning: Up to 3 automatic improvement attempts

**Feedback During Improvement:**
- `evaluate` provides detailed feedback for "needs_improvement"
- `write_draft` incorporates feedback in next iteration
- Web UI shows each improvement stage and feedback in real-time

---

### WebSocket Protocol

Web UI communicates in real-time via WebSocket.

#### Client → Server Messages

```json
{
  "type": "user_message",
  "content": "User input text"
}
```

```json
{
  "type": "reset"
}
```

#### Server → Client Messages

**Node Start (node_start):**
```json
{
  "type": "node_start",
  "node": "write_draft",
  "revision": 0,
  "max_revisions": 3
}
```

**Node Complete (node_end):**
```json
{
  "type": "node_end",
  "node": "evaluate"
}
```

**AI Message (ai_message):**
```json
{
  "type": "ai_message",
  "content": "AI-generated text (question, evaluation, feedback, etc.)"
}
```

**Final Prompt (final_prompt):**
```json
{
  "type": "final_prompt",
  "content": "## Role\n...\n## Background\n..."
}
```

**Error (error):**
```json
{
  "type": "error",
  "message": "Error description"
}
```

**Session Reset (session_reset):**
```json
{
  "type": "session_reset"
}
```

---

### Docker Deployment

#### Dockerfile Details

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Features:**
- Uses Python 3.11 slim image (lightweight)
- No multi-stage build (simple structure)
- Exposes port 8000 (FastAPI default)

#### Build & Run

```bash
# Build image
docker build -t prompt-generator:latest .

# Run container with environment variable
docker run -d \
  -p 8000:8000 \
  -e UPSTAGE_API_KEY=up_xxxxx \
  prompt-generator:latest

# Production run
docker run -d \
  -p 8000:8000 \
  -e UPSTAGE_API_KEY=up_xxxxx \
  --restart unless-stopped \
  prompt-generator:latest
```

#### Environment Variables (Docker Compose)

```yaml
version: '3.8'

services:
  prompt-generator:
    build: .
    ports:
      - "8000:8000"
    environment:
      - UPSTAGE_API_KEY=${UPSTAGE_API_KEY}
    restart: unless-stopped
```

```bash
# Run
UPSTAGE_API_KEY=up_xxxxx docker-compose up -d
```

---

### ProjectPromptGenerator vs PromptGenerator

Two similar projects exist in the same repository. Key differences:

| Item | ProjectPromptGenerator | PromptGenerator |
|------|------------------------|-----------------|
| **Pipeline** | More complex stages | 5 stages (analyze→ask→draft→evaluate→output) |
| **Evaluation Loop** | Up to 5 improvements | Up to 3 improvements |
| **Code Structure** | Larger files, more features | Modular, concise |
| **Focus** | Comprehensive prompt engineering | Fast prototyping & learning |
| **Use Case** | Production environment | Development, experiments, customization |

**When to Use:**
- **PromptGenerator_LangGraph** - Quick start, learning LangGraph
- **ProjectPromptGenerator_LangGraph** - Enterprise-grade prompt generation

---

### Development Tips

#### 1. Debug LLM Responses

The `_parse_json_response` function in `nodes.py` logs JSON parsing failures:

```python
logger.debug("JSON parse failed: %s | raw content: %.200s", exc, content)
```

Set logging to DEBUG to view raw responses:

```python
logging.basicConfig(level=logging.DEBUG)
```

#### 2. Inspect State (CLI Mode)

To check state after each step in `main.py`:

```python
# After graph invocation
print(f"Current state: {state}")
```

#### 3. Debug Web UI

In browser DevTools (F12) → Network tab:
- Monitor WebSocket connections
- Track message send/receive patterns
- Measure server response times

#### 4. Validate API Key

```bash
python -c "
from nodes import _get_llm
from langchain_core.messages import HumanMessage

llm = _get_llm('your_api_key')
response = llm.invoke([HumanMessage(content='hi')])
print('API key is valid!')
"
```

---

## License

This project is part of the LangGraph learning repository.

## Support

For issues or questions:
- Check existing documentation
- Review code comments and examples
- Test with CLI mode first before trying web UI

