"""Maps internal class ids (used in class_names.json and the model output)
to the display labels shown in the API response and the frontend."""

CLASS_LABELS: dict[str, str] = {
    "very_fair": "Very Fair",
    "fair": "Fair",
    "light": "Light",
    "medium": "Medium",
    "olive": "Olive",
    "tan": "Tan",
    "brown": "Brown",
    "deep": "Deep",
}


def label_for(class_id: str) -> str:
    return CLASS_LABELS.get(class_id, class_id.replace("_", " ").title())
