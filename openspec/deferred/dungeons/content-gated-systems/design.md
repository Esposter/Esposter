# Content-Gated Dungeon Systems

Four systems the dungeons game could add, each held until the content it needs exists. Each keeps its own argument and its own revisit trigger.

## Monster evolution

Monsters transforming into stronger species at level thresholds, the genre's long-term reward. Evolution needs target species with their own sprites, an evolution chain in the species data and a reveal sequence. The level-ups, the species data map and the monster instances keyed by `MonsterKey` already exist, so the idea is blocked on content, not architecture.

**Revisit when:** new species art exists.

## Status effects

Battle conditions (poison, sleep, burn) and an elemental type chart multiplying damage by matchup. Both mechanics create decisions only when monsters have distinct kits and stats, and with today's roster they would be invisible complexity. The `Status` model and the battle state machine would both grow meaningfully, so the idea is worth doing once, after the foundations.

**Revisit when:** the roster grows past its current species. The [attack power and defense](../../../specs/dungeons/battle/design.md) and the [roster's stat and kit differentiation](../../../specs/dungeons/monsters-and-items/design.md) have shipped, so new species art is the remaining gate for a type chart to have enough matchups to matter.

## Shops and currency

Money earned from battles, spent at a shop NPC on potions and balls. Items barely matter yet, and potions are free in the starting inventory, so an economy has nothing to price. The NPC effect system can host a shop later, and the save gains a `money` field then.

**Revisit when:** the item catalog grows, with more ball tiers or battle items, since an economy is only as interesting as the things it sells.

## Trainer battles

NPC trainers in the world who challenge the player to battles with fixed parties, the structured difficulty curve of the genre. The battle scene assumes a wild single enemy (capture and flee states, `enemyStore.activeMonster`), so trainers need multi-monster enemy parties, disabled capture and flee, dialog framing and defeat consequences. That is a real battle-scene rework, not content.

**Revisit when:** new species art exists for a trainer's party to draw on. The [attack power and defense](../../../specs/dungeons/battle/design.md) and the [differentiated roster](../../../specs/dungeons/monsters-and-items/design.md) have both shipped, so trainer fights can be tuned.
