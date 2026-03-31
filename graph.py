from langgraph.graph import StateGraph, END

from state import PromptState
from nodes import (
    analyze_input,
    ask_user,
    write_draft,
    evaluate,
    agent_feedback,
    give_output,
)


def missing_info_check(state: PromptState) -> str:
    """Route after analyze_input: missing info → ask_user, complete → write_draft."""
    if state.get("missing_info"):
        return "ask_user"
    return "write_draft"


def quality_check(state: PromptState) -> str:
    """Route after evaluate: needs improvement → agent_feedback, good → give_output."""
    draft = state.get("current_draft", "")
    if "<!-- eval:needs_improvement -->" in draft:
        return "agent_feedback"
    return "give_output"


def build_graph() -> StateGraph:
    builder = StateGraph(PromptState)

    # Register nodes
    builder.add_node("analyze_input", analyze_input)
    builder.add_node("ask_user", ask_user)
    builder.add_node("write_draft", write_draft)
    builder.add_node("evaluate", evaluate)
    builder.add_node("agent_feedback", agent_feedback)
    builder.add_node("give_output", give_output)

    # Entry point
    builder.set_entry_point("analyze_input")

    # analyze_input → ask_user (missing info) or write_draft (complete)
    builder.add_conditional_edges(
        "analyze_input",
        missing_info_check,
        {
            "ask_user": "ask_user",
            "write_draft": "write_draft",
        },
    )

    # ask_user → END (wait for user's next message)
    builder.add_edge("ask_user", END)

    # write_draft → evaluate
    builder.add_edge("write_draft", "evaluate")

    # Conditional routing after evaluate
    builder.add_conditional_edges(
        "evaluate",
        quality_check,
        {
            "agent_feedback": "agent_feedback",
            "give_output": "give_output",
        },
    )

    # agent_feedback → write_draft (revision loop)
    builder.add_edge("agent_feedback", "write_draft")

    # give_output → END
    builder.add_edge("give_output", END)

    return builder.compile()


app = build_graph()
