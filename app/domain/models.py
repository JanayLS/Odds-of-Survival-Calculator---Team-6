from dataclasses import dataclass


@dataclass
class Encounter:
    """
    Represents one logged encounter.
    - timestamp: ISO 8601 string
    - character: which character the encounter belongs to
    - probability: success probability (0–1) after any algorithm transform
    - algo: algorithm name used to compute the stored probability
    """

    timestamp: str
    character: str
    encounter: str
    probability: float
    algo: str = "basic"
    note: str = ""


@dataclass
class UserProfile:
    name: str
    location: str = ""
    email: str = ""
