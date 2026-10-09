---
title: Puzzles
description: The official Teyvat Interactive Map's puzzle marks fitted into each region's generated slice by their four kinds, and the Elemental Monument as a state machine lit by its element or a reaction of its own, a timed one going out after its time. The world does not yet place, draw, strike or solve them.
---

# Puzzles

The client's data holds none of the servers' puzzle mechanisms either, so their places are taken from the official map's public points, the source the [spawned places](/docs/genshin/spawned-places) page names. This page is the first half of the [puzzles](/docs/proposals/genshin/puzzles) proposal: each puzzle mark the map gives is carried into its region's slice by its kind, and an Elemental Monument is a small state machine that a strike or a reaction lights. Nothing is placed in the world, drawn, struck or solved yet.

## How it works

```mermaid
flowchart TD
  P["The official map's points, read into the references folder"] --> K{"A puzzle label: monument, Seelie, shrine or time trial?"}
  K -->|"no"| SKIP["Not a puzzle: left alone"]
  K -->|"yes"| L{"On the ground layer, in a mapped region?"}
  L -->|"no"| LEFT["Left out, and counted in the report"]
  L -->|"yes"| T["Carried into the game's coordinates by the fit's transform"]
  T --> S["One slice per region in genshin-world's generated puzzles folder"]
```

```mermaid
flowchart TD
  H["A monument struck by an element"] --> A["Its elemental state takes the strike, as an enemy's does"]
  A --> R{"Its own element, or a reaction whose element is its own?"}
  R -->|"no"| D["Stays as it was"]
  R -->|"yes"| LIT["Lit, its clock taken from the strike"]
  LIT --> TIMED{"Timed, and past its time since it was lit?"}
  TIMED -->|"yes"| OUT["Out"]
  TIMED -->|"no"| STAY["Stays lit"]
```

## The writer

`pnpm -C scripts genshin:assets puzzles` writes a slice for each region into `packages/genshin-world/src/generated/puzzles/` from the points and the fit, in the chests' format: a compact list of places, each by its map point id, kind and position in game coordinates. It touches no other slice, and its report gives each region's count of places and of those left out.

- **The four kinds are the map's labels.** An Elemental Monument is the monument label, a Seelie is the Seelie label with the two variants the map names beside it (Electro and Warming), a Shrine of Depths is each nation's and the borderland's shrine label, and a Time Trial Challenge is the challenge label. The map gives each nation's shrine a label of its own, so the kind is the one thing those labels share.
- **The ground only and the mapped areas only.** As the chests are, a point on a layer under the ground or in an area no region is mapped to is counted and left out.
- **Only places.** The map gives no element, no timing and no wiring for a mark, so none of those is written. The writer shares its placement with the chests' writer, the `placeMapPoints` primitive, so a kind of point is one label map away from a slice.

## The monument

An `ElementalMonument` holds its element, its own elemental state, whether it is lit, whether it is timed, and the state's clock reading when it was last lit.

- **A strike** (`strikeElementalMonument`) lands on the monument's elemental state through `applyElement`, as a kit's hit lands on an enemy. The monument is lit by the element itself, or by any reaction whose element is its own, so a Swirl that spreads the Pyro on it lights a Pyro monument as much as a Pyro strike does. A lit monument's clock restarts from the strike.
- **A step** (`stepElementalMonument`) moves the elemental state on the fixed step, so its auras decay and its Burning ticks Pyro, lighting it from any reaction of its own. A timed monument that is not lit again goes out once `ELEMENTAL_MONUMENT_LIT_SECONDS` have passed since it was lit; an untimed one stays lit.
- **A solve** (`checkIsMonumentPuzzleSolved`) holds once every monument of a puzzle is lit together, and never by none at all.

`ELEMENTAL_MONUMENT_LIT_SECONDS` is provisional until a recording of a timed monument going out measures it.

## Key files

| File                                                                        | Role                                                                        |
| :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `packages/genshin-world/src/models/puzzle/PuzzleKind.ts`                    | The four kinds the official map marks as puzzles                            |
| `packages/genshin-world/src/models/puzzle/PuzzlePlace.ts`                   | A placed puzzle mechanism: its id, kind and ground point                    |
| `packages/genshin-world/src/models/puzzle/ElementalMonument.ts`             | A monument's element, elemental state, lit state and timing                 |
| `packages/genshin-world/src/services/puzzle/strikeElementalMonument.ts`     | A strike on a monument, lighting it by its element or a reaction of its own |
| `packages/genshin-world/src/services/puzzle/stepElementalMonument.ts`       | A monument's elemental state on the fixed step, and its time going out      |
| `packages/genshin-world/src/services/puzzle/checkIsMonumentPuzzleSolved.ts` | Whether every monument of a puzzle is lit together                          |
| `packages/genshin-world/src/services/puzzle/constants.ts`                   | The timed monument's provisional lit time                                   |
| `packages/genshin-world/src/generated/puzzles/`                             | One slice per region, imported on demand once the world places them         |
| `scripts/src/services/genshinAssets/puzzles/PuzzleKindLabelIdsMap.ts`       | Each kind's labels on the official map                                      |
| `scripts/src/services/genshinAssets/puzzles/writePuzzlePlaces.ts`           | Writes the puzzle places of every region                                    |
| `scripts/src/services/genshinAssets/points/placeMapPoints.ts`               | Carries a kind's labelled points into their regions, shared with chests     |
| `scripts/src/services/genshinAssets/commands/puzzlesCommand.ts`             | `genshin:assets puzzles`                                                    |

## Sources

- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the official map. Its label tree and point list are the public data the writer reads as references.
- [Elemental Monument](https://genshin-impact.fandom.com/wiki/Elemental_Monument), Genshin Impact Wiki: monuments lit by their element, reactions included, some for good and some for a time.
