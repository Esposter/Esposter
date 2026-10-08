---
title: Puzzles
description: Proposal — the open world's puzzles on one framework. Each mechanism is a small state machine moved by the world's doings, a hit's element, a step, a touch or a timer; a puzzle is its mechanisms and its goal, written per puzzle from the wiki since the game's servers keep the wiring; and the general ones come first: Elemental Monuments, Seelies led home, Time Trial Challenges and the Shrines of Depths, each region's own mechanisms arriving with its region.
model: claude-haiku-5-5
---

# Puzzles

Much of the game's exploration is puzzles: monuments lit by an element, Seelies led to their courts, timed challenges, sealed shrines, and every region's own devices. Solving one opens a door, raises a platform or spawns a chest. The mechanisms stand at the [spawned places](/docs/proposals/genshin/spawned-places), they are struck by the [character kits](/docs/proposals/genshin/character-kits), and they unlock the [chests](/docs/proposals/genshin/chests) beside them, so this page waits on all three. Its places and the monument's state machine are built, as the [as-built page](/docs/genshin/puzzles) records; what follows is what remains.

## Decisions

- **A mechanism is a small state machine.** Each kind of mechanism is a deterministic step in the world, as an enemy's AI is, moved by the doings that reach it: a hit of an element through [combat](/docs/genshin/combat)'s rules, the character stepping on it, an interaction, or a timer on the fixed step. Its states are the wiki's description of the kind, and nothing else in the world knows its kind.
- **A puzzle is its mechanisms and its goal, written per puzzle.** Which mechanisms make one puzzle and what solving it does is decided by a scene group on the game's servers, out of the client's reach, so each puzzle's wiring is written as data from the wiki's description of it and confirmed against a recording where the description leaves it open. A puzzle solved stays solved, kept with the player's progress, unless the wiki says it resets.
- **Elemental Monuments.** A monument lights when struck by its element, a reaction's included. Some stay lit once lit; others go out after their time. A puzzle of monuments is solved once all of them are lit together. Settled: the element that lights a monument is the strike's own or a reaction's, so the Swirl that spreads the Pyro on it lights a Pyro monument as the Pyro strike does; a timed monument counts its time from its last strike on its own clock. A puzzle whose monuments must be lit in a set order, such as the Minacious Isle sequence a Seelie shows on a pillar, is written with its own sequence as its goal, once its region's puzzles are wired.
- **Seelies led home.** A Seelie moves along its route toward its court as the player follows it, and goes back to its start if it is not led home in time. Settled in its court it spawns its chest. Elemental Sight draws its trail ([Elemental Sight](/docs/proposals/genshin/elemental-sight)). Its route is the game's server path, so it is the walk on the ground between its fitted start and court until a recording measures its turns.
- **Time Trial Challenges.** Interacting with the challenge's marker starts its timer, and its targets, rings to pass, objects to strike or enemies to defeat, must all be done before it ends; done in time, it spawns its chest.
- **Shrines of Depths.** A shrine is opened with one of its region's Shrine of Depths keys, which the region's statues give ([Statues of The Seven](/docs/proposals/genshin/statues-of-the-seven)), and holds a Luxurious chest. Each region keeps its own keys.
- **The map's labels settle each kind.** The official map gives each mark a label, and the label names the kind: the Seelie variants it names beside the Seelie (Electro and Warming) are Seelies, and each nation's shrine label is one Shrine of Depths kind. The map gives no element, no timing and no wiring for a mark, so those come from the wiki or a recording, never from the points.
- **A region's own mechanisms come with it.** Sumeru's ruins and Withering, Fontaine's devices, Natlan's and every other region's are each written on this framework by the page that builds the region.

## How it works

```mermaid
flowchart TD
  DOING["A doing: an element's hit, a step, F, a timer"] --> MECH["The mechanism's step: its next state"]
  MECH --> GOAL{"The puzzle's goal met by its mechanisms?"}
  GOAL -->|"no"| MECH
  GOAL -->|"yes"| SOLVED["Solved, kept with the progress"]
  SOLVED --> EFFECT["A door opens, a platform rises, or a chest spawns or unlocks"]
  SOLVED --> COUNT["Its area's exploration counts it"]
```

## Scope and order

**Today:** the world holds no mechanism in play. The places of the four kinds are written into their regions' slices, and an Elemental Monument's lit state can be computed from strikes and steps, as the [as-built page](/docs/genshin/puzzles) records. Nothing is placed in the world, drawn, struck or solved yet.

**This adds, in order:**

1. **The framework in the world, with Elemental Monuments in Mondstadt.** The Mondstadt slice is placed into the world, its monuments drawn and struck by the kit's element hits on the fixed step, and each puzzle of monuments wired from the wiki's description of it. The wiring is the step's first input, and it is not yet written.
2. **Seelies**, with Elemental Sight's trail.
3. **Time Trial Challenges.**
4. **Shrines of Depths**, with the keys the statues give.
5. **Each region's own mechanisms**, with its region.

## Data and measures

- **Read from the wiki:** each mechanism kind's states, each puzzle's wiring and effect, and each monument's element and whether it stays lit once lit.
- **Placed by the spawned places:** built, the writer's slices by kind from the official map's marks ([as-built](/docs/genshin/puzzles)).
- **Measured:** a timed monument's time lit, a Seelie's route and speed, and each challenge's limit where the wiki gives none, off recordings, provisional until then. A timed monument's time lit is provisional at sixty seconds until a recording measures it.

## Key files

| File                                                                           | Role after the change                               |
| :----------------------------------------------------------------------------- | :-------------------------------------------------- |
| `packages/genshin-world/src/components/World/Character/Index.vue`              | The kit's landed hits strike the monuments in reach |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | A mechanism in reach to act on                      |
| `packages/genshin-world/src/models/world/RegionData.ts`                        | Gains each region's mechanisms and puzzles          |
| `packages/genshin-world/src/components/World/Screen/Index.vue`                 | Steps the mechanisms in reach on the fixed step     |

## Sources

- [Puzzle](https://genshin-impact.fandom.com/wiki/Puzzle), Genshin Impact Wiki: the mechanisms of the open world and of each region, and what solving them does.
- [Elemental Monument](https://genshin-impact.fandom.com/wiki/Elemental_Monument), Genshin Impact Wiki: monuments lit by their element, reactions included, some for good and some for a time.
- [Genshin Impact: How to Light Up the Elemental Monuments in Minacious Isle](https://gamerant.com/genshin-impact-light-elemental-monuments-minacious-isle/), GameRant: a monument lit by its matching element, and a puzzle whose monuments are lit in a set order.
- [Seelie](https://genshin-impact.fandom.com/wiki/Seelie), Genshin Impact Wiki: Seelies led to their courts, returning if left, Elemental Sight's trail, and the chest a settled Seelie gives.
- [Time Trial Challenge](https://genshin-impact.fandom.com/wiki/Time_Trial_Challenge), Genshin Impact Wiki: the challenges, their limits and their rewards.
- [Shrine of Depths](https://genshin-impact.fandom.com/wiki/Shrine_of_Depths), Genshin Impact Wiki: shrines opened with their region's keys, each holding a Luxurious chest.
