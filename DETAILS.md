# 범용 프롬프트 생성기 기술 상세

## 1. 5단계 LangGraph 노드 상세 (`nodes.py`)
- **analyze_input**: 사용자의 초기 입력을 분석하여 6섹션(역할, 배경, 과제, 제약, 지시, 출력 형식) 중 **부족한 정보(`missing_info`)를 추출**합니다.
- **ask_user**: 부족한 정보가 있을 경우, 사용자에게 해당 내용을 보완해달라는 **질문을 생성**하여 대기를 요청합니다.
- **write_draft**: 수집된 전체 정보를 바탕으로 6개 섹션 템플릿에 맞춘 **초안을 작성**합니다. 누락된 정보는 맥락에 맞게 AI가 유추합니다.
- **evaluate**: 작성된 초안을 객관적으로 평가하고, `<!-- eval:good -->` 또는 `<!-- eval:needs_improvement -->` 태그와 함께 피드백을 기록합니다.
- **give_output**: 평가 태그를 제거하고 사용자에게 **최종 결과물을 반환**합니다.

## 2. 자동 품질 평가 루프 (Self-Correction Loop)
`evaluate` 노드의 결과가 `needs_improvement`일 경우, 개선 루프가 작동합니다.
1. `evaluate` 노드가 구체적인 피드백(예: "제약 사항이 모호함")을 생성.
2. 상태 객체의 `revision_count` 증가.
3. 그래프가 다시 `write_draft`로 돌아가(Feedback 활용) 프롬프트 고도화 진행.
4. **최대 3회(`MAX_REVISIONS = 3`)** 반복 후에도 통과하지 못하면 강제로 `give_output`으로 넘어가 무한 루프를 방지합니다.

## 3. 상태 관리 구조 (`PromptState`)
```python
class PromptState(TypedDict):
    messages: Annotated[list, add_messages] # 전체 대화 내역 유지
    missing_info: list[str]                 # analyze 노드의 추출 결과
    current_draft: str                      # 작성 중인 프롬프트 초안
    api_key: str                            # 세션 보안을 위한 키
    revision_count: int                     # 품질 평가 루프 반복 횟수
```

## 4. WebSocket 스트리밍 프로토콜
- 노드 진입 시 `node_start` 이벤트 발송 (진행률 UI 업데이트용).
- LLM 토큰 생성 시 `ai_message` 이벤트로 화면에 실시간 타이핑 효과 제공.
- 파이프라인 완료 시 `final_prompt` 포맷 발송.
