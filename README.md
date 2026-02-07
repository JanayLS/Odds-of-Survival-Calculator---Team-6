# Odds of Survival Calculator (Team 6)

CLI-first prototype for a D&D “odds of survival” calculator.  

## Project Structure

- `app/` – main application package
  - `cli.py` – CLI entry + menus (temporary while we migrate to web)
  - `domain/` – dataclasses / data models (no I/O)
  - `services/` – core logic (probability, summaries, crypto helpers)
  - `storage/` – loading/saving encrypted journal data
  - `templates/` – Flask HTML templates (placeholders for later)
  - `static/` – Flask static files (CSS/JS/images placeholders for later)
- `data/` – runtime data (encrypted journal, maps, db, etc.). Not committed.
- `tests/` – unit tests / smoke tests

## Setup (Recommended)

### 1) Create + activate a virtual environment

py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install --upgrade pip

### 2) Install dependencies
    pip install -r requirements.txt

### 3) Run the CLI
    python -m app

### Notes
If you lose the password or something goes wrong with the journal file `journal.enc` 
you can delete the journal.enc file from the main root directory

.gitkeep is just an empty placeholder file people add so Git will track an otherwise-empty folder (Git doesn’t commit empty directories).