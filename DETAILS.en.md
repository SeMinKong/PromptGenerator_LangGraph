# Universal Prompt Generator Technical Details

## 1. 5-Stage LangGraph Node Logic (`nodes.py`)
- **analyze_input**: Scans the user's initial idea and identifies `missing_info` across the 6 standard sections (Role, Background, Task, Constraints, Instructions, Output Format).
- **ask_user**: If info is missing, pauses graph execution to ask the user clarifying questions.
- **write_draft**: Generates a full 6-section draft using gathered context and logical assumptions.
- **evaluate**: Acts as an internal critic. Evaluates the draft and outputs an `<!-- eval:good -->` or `<!-- eval:needs_improvement -->` marker alongside actionable feedback.
- **give_output**: Cleans up internal markers and presents the final prompt.

## 2. Self-Correction Loop
If the `evaluate` node detects poor quality (`needs_improvement`):
1. Detailed feedback is logged into the state.
2. The `revision_count` variable increments.
3. The flow routes back to `write_draft`, instructing the LLM to apply the feedback.
4. To prevent infinite loops, the system caps out at 3 retries (`MAX_REVISIONS = 3`).

## 3. State Management (`PromptState`)
```python
class PromptState(TypedDict):
    messages: Annotated[list, add_messages] # Handles memory & history
    missing_info: list[str]
    current_draft: str
    api_key: str
    revision_count: int                     # Limits the correction loop
```
