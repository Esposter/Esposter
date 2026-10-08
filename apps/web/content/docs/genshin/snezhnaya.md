---
title: Snezhnaya
description: Snezhnaya's built parts. Its industrial and capital building kits are parametric generators over the engine's box and lathe kits, each a hall or a factory standing on the origin, and the Kresnik's Torch is a stone plinth, shaft and brazier with a flame standing in its cup. Snezhnograd's first hall stands in its region data at a provisional place.
---

# Snezhnaya

Snezhnaya's region is specified in [its proposal](/docs/proposals/genshin/snezhnaya), and the parts below are the ones built so far. The capital kit stands as Snezhnograd's first hall, a [building landmark](/docs/genshin/region-buildings) on a provisional plateau; the industrial kit and the torch are generators nothing places yet.

## How it works

```mermaid
flowchart TD
  IK[Industrial kit] --> FA[createFactoryGeometry: hall and chimney]
  CK[Capital kit] --> HA[createHallGeometry: storeys stepped back]
  TK[Kresnik's Torch] --> TG[createKresnikTorchGeometry: stone and flame]
  FA --> BX[createBoxesGeometry and createLatheStackGeometry]
  HA --> BX
  TG --> LS[createLatheStackGeometry]
  RD[Region data: snezhnaya.json] --> NL[Snezhnograd's hall, by the capital kit]
```

- **Factories are one hall and one chimney.** `createFactoryGeometry` merges a box for the hall, centred on the origin, with a plain lathe stack for the chimney, which stands at a fixed share of the hall's width. Its width, depth, height and chimney are its options, so each factory is fitted by its caller.
- **Capital halls step back as they rise.** `createHallGeometry` stacks its storeys as boxes, each inset by the setback from the one below, so a palace's tiers are its options and nothing more.
- **Kresnik's Torch is two geometries for two materials.** The stone is a faceted lathe stack of a stepped plinth, a tapering shaft and a cup brazier, and the flame is a lathe of its silhouette standing in the cup at the brazier's rim, 2.15 metres up.
- **Region data holds the capital.** `src/data/regions/snezhnaya.json` holds Snezhnograd's hall, and Everfrozen Earth's outline is a provisional square round it, so a camera that comes within reach fetches it and draws the hall.

## Key files

| File                                                                          | Role                                                    |
| :---------------------------------------------------------------------------- | :------------------------------------------------------ |
| `packages/genshin-world/src/services/snezhnaya/createFactoryGeometry.ts`      | The industrial kit: a factory hall with its chimney     |
| `packages/genshin-world/src/services/snezhnaya/createHallGeometry.ts`         | The capital kit: a hall of storeys set back as it rises |
| `packages/genshin-world/src/services/snezhnaya/createKresnikTorchGeometry.ts` | A Kresnik's Torch as its stone and its flame            |
| `packages/genshin-world/src/models/snezhnaya/FactoryOptions.ts`               | A factory's options                                     |
| `packages/genshin-world/src/models/snezhnaya/HallOptions.ts`                  | A hall's options                                        |
| `packages/genshin-world/src/data/regions/snezhnaya.json`                      | Snezhnaya's region data: Snezhnograd's hall             |

## Notes

- **No torch landmark yet.** A Kresnik's Torch becomes a landmark kind of its own, with its warm light, when the first settlement round one is placed. Until then the kit is built and nothing draws it.
- **Palette and light are not set.** The stone, flame and the nation's shade colours are not chosen, and the torch's light does not reach the scene, since a point light is not one of the lighting model's shared uniforms.

## Sources

- [Snezhnaya](https://genshin-impact.fandom.com/wiki/Snezhnaya), Genshin Impact Wiki: Kresnik's Torch in every settlement, and the nation's factories and capital.
