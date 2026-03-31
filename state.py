from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class PromptState(TypedDict):
    """State for the universal prompt generator agent."""
    messages: Annotated[list, add_messages]  # Conversation history
    missing_info: list[str]                   # List of missing information items
    current_draft: str                        # Current 6-section prompt draft
    api_key: str                              # Per-session Upstage API key
    revision_count: int                       # Number of revision loops completed
