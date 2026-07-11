---
title: Monsters and items
description: The monster/attack/item content maps, the party and details scenes, and the inventory.
---

# Monsters and Items

All creature and item content is data: constant maps validated against Zod schemas, consumed by the party, details, and inventory scenes.

## How it works

**Monsters** — `MonstersDataMap` (5 species: Aquavalor, Carnodusk, Frostsaber, Ignivolt, Iguanignite) defines each species' sprite asset, attack ids, base stats (`level`, `maxHp`, `attack`, `baseExp`) and initial status (`hp`, `exp`). `new Monster(key)` deep-clones the species data and assigns a UUID, so every caught monster is an independent instance whose stats then grow by [level-ups](/docs/dungeons/battle). The player's party lives in `save.player.monsters`.

**Attacks** — `AttackMap` (Slash, Ice Shard) currently carries only a sound-effect key per attack; the visual is a Vue component chosen by `AttackComponentMap`. Damage comes from the monster's `attack` stat alone (see the [attack power and defense](/docs/proposals/dungeons/attack-power-and-defense) proposal).

**Items** — `ItemMap` (Potion: heal 30, DamagedBall: capture) types items by `ItemEffectType`; item behavior in and out of battle is a resolver per effect type (`HealItemResolver`, `CaptureItemResolver`), with `PreviousSceneUsableItemEffectTypesMap` gating which item types are usable from which scene (balls only in battle). Inventory contents persist in `save.player.inventory` with quantities.

**Scenes** — MonsterParty lists the party with HP/level panels (used for switching in battle, healing from inventory, and reordering); MonsterDetails shows one monster's stats and attacks; Inventory lists items with quantity and dispatches to the resolvers.

## Key files

Paths relative to `packages/app`.

| File                                                                             | Role                            |
| -------------------------------------------------------------------------------- | ------------------------------- |
| `shared/assets/dungeons/data/monstersData.ts`                                    | species definitions             |
| `shared/models/dungeons/monster/Monster.ts`                                      | monster instance model + schema |
| `app/assets/dungeons/data/attacks.ts`                                            | attack definitions              |
| `shared/assets/dungeons/data/items.ts`                                           | item definitions                |
| `app/models/resolvers/dungeons/item/`                                            | per-effect-type item resolvers  |
| `app/services/dungeons/scene/inventory/PreviousSceneUsableItemEffectTypesMap.ts` | scene-gated item usability      |
| `app/components/Dungeons/MonsterParty/`                                          | party scene components          |
| `app/components/Dungeons/Inventory/`                                             | inventory scene components      |

## Notes

- All five species currently share identical base stats (attack 5, maxHp 25) and one attack each — the roster is a proof of the data pipeline, not a balanced bestiary. Expansion is proposed in [monster roster expansion](/docs/proposals/dungeons/monster-roster-expansion).
