from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"

JOURNAL_PATH = DATA_DIR / "journal.enc"
FIXED_MAP_PATH = DATA_DIR / "fixed_prob_map.json"
