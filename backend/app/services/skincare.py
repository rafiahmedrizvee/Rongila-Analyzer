"""Skincare guidance engine.

Maps a predicted skin tone class to general, educational skincare guidance,
and adapts the guidance to real-world conditions of the actual photo
analyzed: whether it was a hand or face photo, how confident the
prediction was, and whether lighting looked unreliable. This is
deliberately independent of the ML pipeline so it can be built, tested,
and reused before the trained model exists (Phase 9/10).

Important: this is general educational guidance, not a medical or
dermatological prescription, and every class includes sun protection —
darker tones are not exempt from UV guidance. This module never attempts
to assess skin health, spots, or conditions — see `general_notes` for the
one deliberately generic, non-diagnostic reminder this project includes
instead of any form of visual health screening.
"""

from typing import TypedDict


class Guidance(TypedDict):
    morning: list[str]
    evening: list[str]
    sun_protection: list[str]
    hand_care: list[str]
    notes: list[str]


def _routine(spf: str, extra_evening: str, extra_sun: str) -> dict:
    return {
        "morning": ["Gentle cleanser", "Moisturizer", f"Broad-spectrum sunscreen, {spf}"],
        "evening": ["Gentle cleanser", "Moisturizer", extra_evening],
        "sun_protection": [
            "Reapply sunscreen every 2 hours in direct sun",
            "Seek shade during peak UV hours",
            extra_sun,
        ],
    }


GUIDANCE_BY_CLASS: dict[str, dict] = {
    "very_fair": _routine("SPF 30–50+", "Fragrance-free moisturizer", "Avoid peak-hour sun exposure"),
    "fair": _routine("SPF 30–50+", "Lightweight moisturizer", "Reapply sunscreen every 2 hours outdoors"),
    "light": _routine("SPF 30+", "Gel or lotion moisturizer", "Antioxidant serum if suitable for your routine"),
    "medium": _routine("SPF 30+", "Balanced moisturizer", "Antioxidant-focused routine if suitable"),
    "olive": _routine("SPF 30+", "Balanced moisturizer", "Vitamin C serum if suitable for your routine"),
    "tan": _routine("SPF 30+ (broad-spectrum)", "Hydrating, non-stripping cleanser", "Consistent daily sun protection"),
    "brown": _routine("SPF 30+ (broad-spectrum)", "Rich, hydrating moisturizer", "Avoid harsh exfoliants"),
    "deep": _routine("SPF 30+ (broad-spectrum)", "Rich, hydrating moisturizer", "Avoid harsh exfoliants"),
}

# Hand skin has different real-world stressors than facial skin (frequent
# washing/sanitizing, more direct sun exposure on the back of the hand,
# less product usually applied there) — these tips supplement, not
# replace, the tone-based routine above whenever the analyzed photo was a
# hand rather than a face.
HAND_CARE_TIPS = [
    "Reapply hand cream after every hand-washing — frequent washing strips natural oils faster than facial skin loses them",
    "The backs of the hands get regular sun exposure but are often skipped when applying sunscreen — include them daily",
    "Use a thicker, barrier-repairing cream (look for ceramides or shea butter) rather than a lightweight facial lotion",
    "Gentle exfoliation once or twice a week helps with rough or flaky patches on the hands",
]

GENERAL_NOTES = [
    "This tool estimates visible color only — it does not screen for skin conditions. "
    "If you notice a new, changing, or unusual spot anywhere on your skin, it's worth mentioning to a doctor or dermatologist.",
]


def get_guidance(
    class_id: str,
    *,
    face_detected: bool = True,
    confidence: float | None = None,
    lighting_warning: str | None = None,
) -> Guidance:
    """Return guidance for a class id (e.g. 'medium'), adapted to the real
    conditions of the photo that was actually analyzed.

    Falls back to a safe generic routine if an unexpected class id is ever
    passed in, rather than raising, since this runs after a prediction has
    already succeeded.
    """
    base = GUIDANCE_BY_CLASS.get(
        class_id,
        _routine("SPF 30+", "Balanced moisturizer", "Consistent daily sun protection"),
    )

    notes = list(GENERAL_NOTES)
    if lighting_warning:
        notes.append(lighting_warning)
    if confidence is not None and confidence < 0.5:
        notes.append(
            "Confidence for this result was moderate — for a more reliable read, "
            "try a well-lit, in-focus photo with bare skin clearly visible."
        )

    return {
        "morning": base["morning"],
        "evening": base["evening"],
        "sun_protection": base["sun_protection"],
        "hand_care": [] if face_detected else HAND_CARE_TIPS,
        "notes": notes,
    }
