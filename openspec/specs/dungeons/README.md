# Dungeons

Dungeons is Esposter's monster-catching RPG at `/dungeons`: walk a tile-based world, talk to NPCs, open chests, trigger random encounters in tall grass, and fight turn-based battles where you attack, use items, switch monsters, capture the enemy, or flee. It is built on Phaser through [vue-phaserjs](../vue-phaserjs/README.md) — every Phaser scene and game object is a Vue component.

## Key concepts

- **Scenes are Vue components** — `SceneComponentMap` maps each `SceneKey` (Preloader, Title, World, Battle, Inventory, MonsterParty, MonsterDetails, Settings, MobileJoystick) to an async component rendered inside vue-phaserjs's `<Game>`. See [scenes and input](scenes-and-input/design.md).
- **Generated Tiled types** — maps are authored in Tiled Map Editor; `pnpm tiled:gen` parses the `.tmx` files with `parse-tmx` and generates enums and layer/object-property types into `shared/generated/tiled/`, so map content is type-checked. See [world](world/design.md).
- **Battle state machine** — a generic `StateMachine` of named states drives every battle turn. See [battle](battle/design.md).
- **Data-driven content** — monsters, attacks, items, NPCs, and encounter areas are constant maps in `assets/dungeons/data/` and `shared/assets/dungeons/data/`. See [monsters and items](monsters-and-items/design.md).
- **One save blob per user** — a `Dungeons` entity (save + settings) persisted through the generic blob-state procedures (auth) or localStorage (unauth), the same pattern as [clicker](../clicker/game-loop-and-saves/design.md). See [saves and settings](saves-and-settings/design.md).

## Pages

- [Scenes and input](scenes-and-input/design.md) — scene components, scene switching, input resolvers, mobile joystick.
- [World](world/design.md) — Tiled pipeline, grid movement, NPCs, interactions, random encounters.
- [Battle](battle/design.md) — the state machine, damage/experience/capture math.
- [Monsters and items](monsters-and-items/design.md) — content data, party management, inventory.
- [Saves and settings](saves-and-settings/design.md) — persistence, the settings scene, achievements.

No open work. Decided ideas: [deferred](../../deferred/dungeons/), [rejected](../../rejected/dungeons/).

## Shipped log

Chronological, one line per feature.

- **Single save** — one optional `save` per user rather than a list of them.
- **Attack power and defense** — per-attack `power`, per-species `defense`, and a saturating damage formula, so move choice and bulk both matter.
- **Monster roster expansion** — differentiated stat archetypes, 2–3 move kits per species, and level-scaled weighted encounters.
- **Milestone achievements** — captures, levels, collection, and chests evaluated from the save payload on each manual save.
