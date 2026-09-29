---
title: Exploring
description: Proposal — how the world is explored before a character exists. A free camera flies over the continent with the keyboard, mouse, gamepad or touch. A jump list teleports to any Teleport Waypoint or Statue of The Seven, with a short arrival as the game has. A map overlay on M, drawn from the same catalogue, shows the regions, areas and waypoints and where the camera is.
model: claude-opus-5-5
---

# Exploring

This page builds on the [world map](/docs/proposals/genshin/world-map), whose waypoints and outlines it presents. The world is built before anything can walk in it, and it still has to be seen at every scale: a close pass over Windrise's grass, a sweep along Liyue's karst, the whole of Inazuma from above. Exploring is the camera and the map that let a person do that. It is replaced, not extended, when the phase-three character controller arrives. After that the character walks and the free camera stays as a photo mode.

## Decisions

- **A free camera with a sense of place.** It flies with the usual keys and mouse look, a gamepad's two sticks, or two thumbs on touch. The speed rises with the height above the ground, so crossing a region takes seconds and a slow pass over grass stays slow. The camera never goes below the terrain or the water surface, except by diving into water, which enters the world under water.
- **Teleport like the game.** A jump list, grouped by region and area, holds every Teleport Waypoint and Statue of The Seven in the catalogue. Choosing one fades out, loads the target's region if it is not in reach, and fades in at the waypoint facing the direction its reference captures face. Teleporting, rather than a flight across the map, is how a person goes between regions, as in the game.
- **The map is drawn from the catalogue.** M opens a top-down map of the continent. Region and area outlines are coloured by region, waypoints and statues are icons, the names are the catalogue's, and the camera is a pointer. The map is drawn from the authored shapes, never from the official map's imagery. Clicking a waypoint teleports to it.
- **The hour and weather are at hand.** A small control sets the clock and forces an area's weather. This is the same control the [reference board](/docs/proposals/genshin/reference-board)'s overlay uses to match a capture.
- **Everything is reachable without the world.** The jump list and the map are DOM with keyboard focus and screen-reader names, so the world is never the only way to reach them. A person who cannot fly the camera can still go everywhere.

## How it works

```mermaid
flowchart TD
  IN[Keys, mouse, gamepad or touch] --> FC[Free camera: speed by height above ground]
  FC --> CL{Below terrain or water surface?}
  CL -->|terrain| CLAMP[Held above the ground]
  CL -->|water| UW[Enter the world under water]
  JL[Jump list or map click] --> WP[Waypoint in the catalogue]
  WP --> RCH{Its region in reach?}
  RCH -->|no| LOAD[Load the region's data]
  RCH -->|yes| FADE[Fade, move, face the reference direction, fade in]
  LOAD --> FADE
  M[M key] --> MAP[Map overlay from authored outlines]
  MAP --> JL
```

## Scope

**Today:** orbit controls circle one point of the Windrise scene, and nothing reaches past it.

**This adds:**

1. **The free camera**, for every input.
2. **The jump list and teleport.**
3. **The map overlay.**
4. **The hour and weather control.**

## Key files

| File                                                | Role after the change                               |
| :-------------------------------------------------- | :-------------------------------------------------- |
| `apps/web/app/components/AgentConsole/Joystick.vue` | The touch joystick the free camera reuses on phones |

New files:

```text
apps/web/app/components/Genshin/FreeCamera.vue
apps/web/app/components/Genshin/JumpList.vue
apps/web/app/components/Genshin/MapOverlay.vue
apps/web/app/components/Genshin/ClockControl.vue
```

## Notes

- **The joystick moves to a shared home.** It is written for the agent console today. The free camera's use makes it shared, so it moves out of the console's folder in the same change rather than being copied.

## Sources

- [Teleport Waypoint](https://genshin-impact.fandom.com/wiki/Teleport_Waypoint), Genshin Impact Wiki: fast travel by selecting a waypoint on the map, with statues and domains acting as waypoints too.
- [Map](https://genshin-impact.fandom.com/wiki/Map), Genshin Impact Wiki: the map on M, and teleporting from it.
- [Game accessibility guidelines](https://gameaccessibilityguidelines.com/full-list/): support for several input devices, and menus reachable without the play itself.
