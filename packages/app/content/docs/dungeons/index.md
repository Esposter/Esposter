---
title: Dungeons
description: The Pokémon-style monster-catching RPG — Phaser scenes as Vue components, a tile-based world, turn-based battles, and a single save blob per user.
---

# Dungeons

Dungeons is Esposter's monster-catching RPG at `/dungeons`: walk a tile-based world, talk to NPCs, open chests, trigger random encounters in tall grass, and fight turn-based battles where you attack, use items, switch monsters, capture the enemy, or flee. It is built on Phaser through [vue-phaserjs](/docs/vue-phaserjs) — every Phaser scene and game object is a Vue component.

## Key concepts

- **Scenes are Vue components** — `SceneKeyMap` maps each `SceneKey` (Preloader, Title, World, Battle, Inventory, MonsterParty, MonsterDetails, Settings, MobileJoystick) to an async component rendered inside vue-phaserjs's `<Game>`. See [scenes and input](/docs/dungeons/scenes-and-input).
- **Generated Tiled types** — maps are authored in Tiled Map Editor; `pnpm tiled:gen` parses the `.tmx` files with `parse-tmx` and generates enums and layer/object-property types into `shared/generated/tiled/`, so map content is type-checked. See [world](/docs/dungeons/world).
- **Battle state machine** — a 17-state generic `StateMachine` drives every battle turn. See [battle](/docs/dungeons/battle).
- **Data-driven content** — monsters, attacks, items, NPCs, and encounter areas are constant maps in `assets/dungeons/data/` and `shared/assets/dungeons/data/`. See [monsters and items](/docs/dungeons/monsters-and-items).
- **One save blob per user** — a `Dungeons` entity (save + settings) persisted through the generic blob-state procedures (auth) or localStorage (unauth), the same pattern as [clicker](/docs/clicker/game-loop-and-saves). See [saves and settings](/docs/dungeons/saves-and-settings).

## Pages

- [Scenes and input](/docs/dungeons/scenes-and-input) — scene components, scene switching, input resolvers, mobile joystick.
- [World](/docs/dungeons/world) — Tiled pipeline, grid movement, NPCs, interactions, random encounters.
- [Battle](/docs/dungeons/battle) — the state machine, damage/experience/capture math.
- [Monsters and items](/docs/dungeons/monsters-and-items) — content data, party management, inventory.
- [Saves and settings](/docs/dungeons/saves-and-settings) — persistence, the settings scene, achievements.

Open work: [roadmap](/docs/dungeons/roadmap). Decided ideas: [deferred](/docs/dungeons/deferred), [rejected](/docs/dungeons/rejected).

## Shipped log

Chronological, one line per feature.

- **Single save** — collapsed the unused multi-save array into one `save` field, with a legacy-shape migration on read.
- **Attack power and defense** — per-attack `power`, per-species `defense`, and a saturating damage formula, so move choice and bulk both matter.
