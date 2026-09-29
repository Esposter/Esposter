---
title: Weather
description: Proposal — Genshin's weather, set per area as the game sets it and drawn only where the camera stands. Rain and thunderstorms first, then snow, fog and sandstorms, each as particles in a volume that follows the camera, a shift of the sky's keyframes, and one wetness uniform.
model: claude-opus-5-5
---

# Weather

This page builds on [sky and time](/docs/genshin/sky-and-time), whose keyframes light the world, and takes each area's weather from the [world map](/docs/genshin/world-map)'s catalogue. It was split out of the sky's proposal when the sky shipped, since weather is set per area and areas only arrive with the world map.

## Decisions

- **Weather belongs to an area, as in the game.** Each area in the catalogue names the weather it can have, and only the weather where the camera stands is drawn:
  - clear, cloudy, rain and thunderstorm for most areas
  - snow and snowstorms on Dragonspine
  - fog on Tsurumi Island
  - sandstorms in the Desert of Hadramaveth
  - no rain in cities or deserts
  - Inazuma's permanent storm available as an area setting
- **Weather is particles, tint and a ramp shift.** Rain is instanced streaks in a volume that follows the camera, with splashes where they meet the ground. Snow uses the same volume with slower, drifting flakes. Wet surfaces darken and gain specular through one wetness uniform. Lightning is a brief flash through the sky and the light, followed by a bolt drawn as a mesh. A sandstorm is a thick fog colour and a streak layer driven by the wind.
- **Weather shifts the sky, not a second sky.** A weather's keyframes are the day's blended toward its own colours by one amount, and it raises the sky's cloud coverage and the fog's density, so a storm darkens the same dome, light and haze the clear day uses.

## How it works

```mermaid
flowchart TD
  A[Camera's area in the catalogue] --> W{Which weather?}
  W -->|clear or cloudy| Y[Sky keyframes, cloud coverage]
  W -->|rain or storm| RN[Rain volume, wetness, lightning]
  W -->|snow| SN[Snow volume]
  W -->|fog or sandstorm| FG[Denser fog, streaks]
  RN --> U[Sky state blended toward the weather's colours]
  SN --> U
  FG --> U
  Y --> U
  U --> M[Toon materials, fog, sky]
```

## Scope

**Today:** the sky is always clear, with a region's fixed cloud coverage.

**This adds:**

1. **Rain and thunderstorms**, since Mondstadt and Liyue need them.
2. **Snow, fog and sandstorms** as their regions arrive.

## What this does not propose

- **Weather's effect on play.** Rain putting out fires or making characters wet is play, and it waits for the phase-three pages that bring a character.

## Key files

| File                                                       | Role after the change                                      |
| :--------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-engine/src/atmosphere/sampleSkyState.ts` | The day's sky, which a weather blends toward its own       |
| `packages/genshin-engine/src/atmosphere/applySkyState.ts`  | Where the blended sky is written into everything it lights |

New files:

```text
packages/genshin-engine/src/nodes/        ← rain and snow node graphs
apps/web/app/components/Genshin/Weather.vue
```

## Sources

- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: weather tied to areas with only the current location's drawn, rain and thunderstorms, no rain in cities or deserts, snow on Dragonspine, fog on Tsurumi Island, and sandstorms in the Desert of Hadramaveth.
