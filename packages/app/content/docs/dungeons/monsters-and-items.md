---
title: Monsters and items
description: The monster/attack/item content maps, the party and details scenes, and the inventory.
---

# Monsters and Items

All creature and item content is data: constant maps validated against Zod schemas, consumed by the party, details, and inventory scenes.

## How it works

**Monsters** — `MonstersDataMap` (5 species) defines each species' sprite asset, attack kit, base stats (`level`, `maxHp`, `attack`, `defense`, `baseExp`) and initial status (`hp`, `exp`). Each species plays a distinct role: Aquavalor is the tank (low attack, high defense and HP), Carnodusk is fast and fragile (highest attack, lowest defense and HP), Frostsaber is the rare prize encounter (strong on every axis, highest `baseExp`), Ignivolt is a glass cannon, and Iguanignite is the balanced starter. `new Monster(key)` deep-clones the species data and assigns a UUID, so every caught monster is an independent instance whose stats then grow by [level-ups](/docs/dungeons/battle). The player's party lives in `save.player.monsters`.

**Attacks** — `AttackMap` gives every species a 2–3 move kit: the shared basics Slash (power 40) and Bite (power 30, the weak filler), Ice Shard (power 55), and one signature move per non-starter species — Aqua Jet (45, high power to offset the tank's low attack), Shadow Claw and Volt Claw (50, burst payoffs), and Frost Fang (60, the strongest attack, befitting the prize encounter). Each attack carries a power value and a sound-effect key; the visual is a Vue component chosen by `AttackComponentMap`, and the signature moves reuse the Slash/IceShard animation components. The [damage roll](/docs/dungeons/battle) folds the chosen attack's power against the defender's `defense`, so a monster's moves genuinely differ.

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

- Monsters already caught keep their stored stats ([saves embed monster instances](/docs/dungeons/saves-and-settings)) — an instance's stats are earned progression, not content to hot-patch; only newly encountered monsters pick up rebalanced species data.
- The roster deliberately stays at five species until sprite art for new ones exists — mechanical depth beats headcount. The signature attacks reuse existing animation components and sound effects; distinct art per move is follow-up work.
