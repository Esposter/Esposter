---
title: Trainer battles
description: Scripted battles against NPCs with fixed parties and rewards.
---

# Trainer Battles

NPC trainers in the world who challenge the player to battles with fixed parties — the structured difficulty curve of the genre.

**Why deferred:** The battle scene assumes a wild single enemy (capture and flee states, `enemyStore.activeMonster`); trainers need multi-monster enemy parties, disabled capture/flee, dialog framing, and defeat consequences. Real value, but it builds on combat that is currently undifferentiated — depth first.

**Revisit when:** [attack power and defense](/docs/proposals/dungeons/attack-power-and-defense) and [monster roster expansion](/docs/proposals/dungeons/monster-roster-expansion) have shipped, so trainer fights can actually be tuned.
