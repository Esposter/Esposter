# Clicker

Clicker is Esposter's idle game at `/clicker`: click the central item to earn points, spend points on **buildings** that produce points per second, and buy **upgrades** that multiply production. It is a faithful Cookie Clicker homage (its building tiers, Cursor to Idleverse) reskinned through switchable **clicker types** (Default / Magical / Physical) that change the item's name, icon, and color everywhere.

## Key concepts

- **Data-driven content** — buildings and upgrades are plain constant maps in `shared/assets/clicker/data/` keyed by enum ids and typed by `satisfies`; the server just serves them (`readBuildingMap` / `readUpgradeMap`). Adding content means adding a map entry, not code.
- **Effect engine** — every upgrade carries `Effect[]` records; pure functions fold them over a base power by effect type (additive, multiplicative, per-building). See [effect engine](effect-engine/design.md).
- **Split Pinia stores** — `clicker/` (save root + type theming), `clicker/point`, `clicker/building`, `clicker/upgrade`, `clicker/mouse`, `clicker/popup`, `clicker/offlineProgress`; each owns one concern and composes the others per the store-to-store convention.
- **One save blob per player** — the whole game state is a single `Clicker` entity. Signed-in players persist it per account through the generic blob-state procedures; unauthenticated players persist it in localStorage, so their save is scoped to the browser/device, not a user. Games deliberately stay off the resource layer ([games integration](../../rejected/resource/games-integration/design.md)). See [game loop and saves](game-loop-and-saves/design.md).
- **Achievements** — the clicker achievements unlock through the achievement tRPC-path middleware on `clicker.saveClicker`: save-count thresholds and milestones whose conditions read the save payload (`shared/services/achievement/definitions/ClickerAchievementDefinitionMap.ts`).

## Pages

- [Buildings and upgrades](buildings-and-upgrades/design.md) — the store, pricing, unlock conditions, and buying flow.
- [Effect engine](effect-engine/design.md) — how upgrade effects compute building and mouse power.
- [Game loop and saves](game-loop-and-saves/design.md) — timers, autosave, and auth/unauth persistence.
- [Offline progress](offline-progress/design.md) — the capped welcome-back production award.
- [Clicker types](clicker-types/design.md) — the Default/Magical/Physical theming layer.

No open work. Decided ideas: [deferred](../../deferred/clicker/), [rejected](../../rejected/clicker/).

## Shipped log

- **Core refactors** — normalized id-based save data, single 60 FPS game tick, exponential building price curve.
- **Milestone achievements** — points/collection/completion milestones evaluated from the save payload alongside the save-count ladder.
- **Offline progress** — capped welcome-back production award with a summary dialog.
- **Bulk buy** — ×1/×10/×100 purchase toggle with exact summed pricing.
