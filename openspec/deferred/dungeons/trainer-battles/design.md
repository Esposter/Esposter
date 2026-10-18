# Trainer Battles

NPC trainers in the world who challenge the player to battles with fixed parties — the structured difficulty curve of the genre.

**Why deferred:** The battle scene assumes a wild single enemy (capture and flee states, `enemyStore.activeMonster`); trainers need multi-monster enemy parties, disabled capture/flee, dialog framing, and defeat consequences — a real battle-scene rework, not content.

**Revisit when:** the next dungeons content push — the combat foundations ([attack power and defense](../../../specs/dungeons/battle/design.md)) and the [differentiated roster](../../../specs/dungeons/monsters-and-items/design.md) have both shipped, so trainer fights can now actually be tuned.
