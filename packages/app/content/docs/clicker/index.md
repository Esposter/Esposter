---
title: Clicker
description: The Cookie-Clicker-style idle game — buildings, upgrades, a data-driven effect engine, and a single save blob per player.
---

# Clicker

Clicker is Esposter's idle game at `/clicker`: click the central item to earn points, spend points on **buildings** that produce points per second, and buy **upgrades** that multiply production. It is a faithful Cookie Clicker homage (the 19 building tiers from Cursor to Idleverse) reskinned through switchable **clicker types** (Default / Magical / Physical) that change the item's name, icon, and color everywhere.

## Key concepts

- **Data-driven content** — buildings and upgrades are plain constant maps in `shared/assets/clicker/data/` keyed by enum ids and validated by Zod schemas; the server just serves them (`readBuildingMap` / `readUpgradeMap`). Adding content means adding a map entry, not code.
- **Effect engine** — every upgrade carries `Effect[]` records; pure functions fold them over a base power by effect type (additive, multiplicative, per-building). See [effect engine](/docs/clicker/effect-engine).
- **Split Pinia stores** — `clicker/` (save root + type theming), `clicker/point`, `clicker/building`, `clicker/upgrade`, `clicker/mouse`, `clicker/popup`; each owns one concern and composes the others per the store-to-store convention.
- **One save blob per player** — the whole game state is a single `Clicker` entity. Signed-in players persist it per account through the generic blob-state procedures; unauthenticated players persist it in localStorage, so their save is scoped to the browser/device, not a user. Games deliberately stay off the resource layer ([games integration](/docs/platform/rejected/games-integration)). See [game loop and saves](/docs/clicker/game-loop-and-saves).
- **Achievements** — five clicker achievements unlock through the achievement tRPC-path middleware counting `clicker.saveClicker` calls (`shared/services/achievement/definitions/ClickerAchievementDefinitionMap.ts`).

## Pages

- [Buildings and upgrades](/docs/clicker/buildings-and-upgrades) — the store, pricing, unlock conditions, and buying flow.
- [Effect engine](/docs/clicker/effect-engine) — how upgrade effects compute building and mouse power.
- [Game loop and saves](/docs/clicker/game-loop-and-saves) — timers, autosave, and auth/unauth persistence.
- [Clicker types](/docs/clicker/clicker-types) — the Default/Magical/Physical theming layer.

Open work: [roadmap](/docs/clicker/roadmap). Decided ideas: [deferred](/docs/clicker/deferred), [rejected](/docs/clicker/rejected).
