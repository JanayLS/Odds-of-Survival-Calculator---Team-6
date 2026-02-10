# Plague Village/Odds of Survival Calculator (Team 6)

<img width="200" height="200" alt="mushroomplaguedoctor" src="https://github.com/user-attachments/assets/c18e8626-5218-40b7-89dd-c6ccd7f7e514" /><br><br>
***A visual novel game set during the Black Plague in the year 1349. The player takes on the role of a traveling plague doctor who arrives in a dying medieval village. Rats spread disease through the streets,
villagers fall ill, and time is limited. The player must gather ingredients, brew potions, and decide who to treat, knowing that every choice affects survival outcomes...***<br>
## Gameplay
Gather ingredients and create potions to cure as many villagers as possible while avoiding infection from rats. **Survival is not guaranteed, and difficult choices must be made throughout the game**.
## Project Structure
- `app/` – main application package
  - `cli.py` – CLI entry + menus (temporary while we migrate to web)
  - `domain/` – dataclasses / data models (no I/O)
  - `services/` – core logic (probability, summaries, crypto helpers)
  - `storage/` – loading/saving encrypted journal data
  - `templates/` – Flask HTML templates (placeholders for later)
  - `static/` – Flask static files (CSS/JS/images placeholders for later)
- `data/` – runtime data (encrypted journal, maps, db, etc.). Not committed.
- `docs/` – Documents, guidance, and information about the project
- `tests/` – unit tests / smoke tests

## Group Members
### Project Manager
Janay Snell
### Front End
Maria Del Carmen<br>
Noah Yarosz<br>
Zoe Craig
### Back End
Andrew Dang<br>
Gavin McKenzie<br>
Oscar Salinas-Villarreal

