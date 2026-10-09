---
title: Nod-Krai
description: Proposal — Nod-Krai, the moonlit borderland archipelago at Snezhnaya's southern tip. Islands formed from what was left over when the Three Moons were made, dieselpunk ports and Fatui works, the Frostmoon Scions' enclaves, and Statues of the New Moon in place of the Seven. The look is set by the game's own data and references more than by any other region's precedent.
model: claude-opus-5-5
needs: [game-exports, parity-page]
touches:
  [
    "packages/genshin-world/src/models/nod-krai/**",
    "packages/genshin-world/src/services/nod-krai/**",
    "packages/genshin-world/src/components/World/Screen/Index.fixture.ts",
    "packages/genshin-world/parity/main.ts",
    "packages/genshin-world/parity/models/ScreenFixture.ts",
    "scripts/src/services/genshinParity/shared/openParityPage.ts",
  ]
---

# Nod-Krai

This region is built on [terrain](/docs/genshin/terrain) and its [shapes](/docs/proposals/genshin/terrain-shapes), [vegetation](/docs/genshin/vegetation) and its [trees and scatter](/docs/proposals/genshin/trees-and-scatter), [water](/docs/genshin/water) and its [flow](/docs/proposals/genshin/flowing-water), [sky and time](/docs/genshin/sky-and-time) and [weather](/docs/proposals/genshin/weather), re-derived by the [scene derivation](/docs/genshin/scene-derivation)'s method, each scene in its [recreation passes](/docs/proposals/genshin/recreation-passes). Nod-Krai is an autonomous region at the southern edge of Snezhnaya, an archipelago formed from the material left over when the Three Moons were made. Its culture is fictional, drawn from the Baltic with dieselpunk machinery. People from every nation gather there, the Fatui run a stronghold there, and its indigenous Frostmoon Scions worship a moon goddess. It is the newest of the nations' neighbours in the game, and the least documented, so its page commits to the mechanism and leaves its look to the game's own exports.

## Decisions

- **The moon is part of its sky.** Nod-Krai's deep connection to the moons makes the moon a larger, brighter element of its night sky, a regional override of the [sky](/docs/genshin/sky-and-time)'s moon. Its captures at night set how large and how bright.
- **An archipelago of distinct isles.** Lempo Isle, Hiisi Island and Paha Isle are separate islands with their own outlines in the [world map](/docs/genshin/world-map), joined by the Moontide Sea. The sea between them is part of the region, as it is for Inazuma.
- **Two kits: the dieselpunk and the Scions'.** The first builds the ports, towns and Fatui works: riveted iron, pipework, cranes, smokestacks and timber sheds. The second builds the Frostmoon Scions' enclaves and stone circles. Both are fitted against their own exports, since no earlier region's kit carries over.
- **Statues of the New Moon.** Nod-Krai's statues stand where other regions have Statues of The Seven. They are a landmark kind of their own and act as waypoints in [exploring](/docs/proposals/genshin/exploring).

## How it works

```mermaid
flowchart TD
  EXP[Nod-Krai's exports] --> PK[Kit parameters fitted against them]
  PK --> KI{Which kit?}
  KI -->|dieselpunk| DP[Riveted iron, pipework, cranes, smokestacks]
  KI -->|Frostmoon Scions| FS[Enclaves and stone circles]
  CLK[Clock at night] --> MO{In Nod-Krai?}
  MO -->|yes| BIG[Regional moon override: larger, brighter]
  MO -->|no| STD[The sky's standard moon]
```

## Areas

The catalogue holds Nod-Krai's areas as the game names them: Lempo Isle, Hiisi Island, Paha Isle, the Moontide Sea, the Lunar Highlands, Wavechaser Plain, Ashveil Peak, Dunanna Pit, Voidsea Outlook and the Dark Side of the Moon. Subareas include Nasha Town, the Frostmoon Enclave, Blue Amber Lake, Silvermoon Hall, Golden Hall, Favonius Keep, Cliffwatch Camp, the Nuur Stone Circle, the Pillar of Embla, Piramida, Traveler's Crater and Starsand Shoal.

## Build order

1. **Nasha Town** and its isle, where the game enters.
2. **The Frostmoon Enclave** and the Scions' sites.
3. **The other isles** and the Moontide Sea, then the rest in the catalogue's order.

## Reference checklist

Nasha Town's port and main street, a Statue of the New Moon, the Frostmoon Enclave, Blue Amber Lake, a Fatui works, the moon at night from each isle, and the sea between the isles.

## Key files

| File                                                      | Role after the change                     |
| :-------------------------------------------------------- | :---------------------------------------- |
| `packages/genshin-engine/src/noise/createSimplexNoise.ts` | The detail noise each isle's ground tunes |

The two kits' generators and the region's data file are built, as [Nod-Krai's kits](/docs/genshin/nod-krai-kits), and Nasha Town's first works stand as a [building landmark](/docs/genshin/region-buildings). Their fitted values are not.

**Still to build, in order:**

1. **Nasha Town's witness claims**, the family map `nod-krai-every-renderer` on the roadmap names, shaped as [Inazuma](/docs/proposals/genshin/inazuma)'s Decisions shape a capital's; before them, `ScreenFixture` takes `witnessComponents` as Inazuma's first step lays out, unless a region has added it.
   - `models/nod-krai/NodKraiPartFamily.ts` (`Ground`, `Buildings`) and `services/nod-krai/NodKraiPartFamilyMeshRegexMap.ts`: `Ground` `/^BigWorldTerrain_/u`, and `Buildings` `/^Area_Ndkl_Build_/u`, the works the dieselpunk kit stands in for.
   - `services/nod-krai/NodKraiUndrawnMeshRegexMap.ts`, from the names under `~/Esposter/genshin-parity/extracted/nod-krai/`: `props` `/^(?:Area_(?:Ndkl|Common)_Prop|Area_Ly_Props?|Area_MdProps)_/u`, `lights` `/^Area_Ndkl_Light_/u`, `plants` `/^Area_Ndkl_Grass_/u`, `rocks` `/^Area_Nt_Rock_/u`, `stagePlanes` `/^Stages_(?:Plane|DecalCube)_/u` and `effects` `/^Eff_/u`; every mesh the export names is matched.
   - The fixture's `witnessComponents` gains `nod-krai` with both.
   - Proof: the region's Inventory pass (`pnpm -C scripts genshin:parity passes nod-krai --pass Inventory`) leaves 0 renderers unclaimed.
2. **The kits' fitted values**, as the passes after the inventory read them.

## Sources

- [Nod-Krai](https://genshin-impact.fandom.com/wiki/Nod-Krai), Genshin Impact Wiki: an autonomous region at Snezhnaya's southern tip, an archipelago from the Three Moons' remnant material, the Frostmoon Scions, the Fatui stronghold, the Statues of the New Moon, and its areas and subareas.
- [The setting of Genshin Impact](https://en.wikipedia.org/wiki/Teyvat), Wikipedia: Nod-Krai's fictional culture drawn from the Baltic Sea area with dieselpunk elements.
