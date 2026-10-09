---
title: Map
description: The world's map on M, and the jumps it makes. The game's open map at full screen: one drawing of the catalogue (the outlines of its filled areas and every unlocked landmark a jump lands at) placed on the player, north up, with each area's name, the player as a pointer, and the game's close button and zoom slider, which the map is dragged to pan and the wheel or the slider zooms. Choosing a landmark, on the map or in the keyboard's jump list, fades the world to black, places the view in front of it facing it, and fades back in.
---

# Map

The game's map opens on M and is how a player crosses the continent: they choose a Teleport Waypoint or a Statue of The Seven and arrive there. The world's map is built the same way. It draws the [world map](/docs/genshin/world-map)'s catalogue rather than any of the game's imagery, and a jump lands the [character](/docs/genshin/character-controller) in front of the landmark chosen.

## How it works

```mermaid
flowchart TD
  M["M, or the HUD's minimap"] --> SCR["The screen kind becomes Map, which holds the world as a menu does"]
  SCR --> OV["The overlay: the drawing placed on the player, area names, pointer, close button and zoom slider"]
  REG["Every region's data, read once"] --> LM["The landmarks a jump lands at"]
  LM --> OV
  OV -->|"a landmark chosen, on the map or in the jump list"| POSE["The jump's pose: in front of it, facing it"]
  POSE --> CLOSE["The map closes to the world"]
  CLOSE --> FADE["The screen fades to black"]
  FADE -->|"the fade ends"| PLACE["The character placed on the ground there, the camera behind it"]
  PLACE --> IN["The screen fades back in"]
```

- **One drawing, two views.** `Map/Drawing` draws the outlines of the filled areas and every unlocked landmark a jump lands at ([map unlocking](/docs/genshin/map-unlocking)), in world metres with x east and z south, so north is up. The overlay places it relative to the player and the [minimap](/docs/genshin/minimap) cuts it to a circle round the camera, so the two never disagree about what the world holds. A mark's radius is a share of the extent a view shows, so it is drawn one size at any scale.
- **The overlay is the open map at full screen.** It places the drawing on the player with `MAP_VIEW_METRES` metres across its width, the player's pointer at the place the reference shows it, and the screen's own aspect fills the rest. The view starts at that width and moves from it as the map is panned and zoomed. Each filled area's name sits at the middle of its outline, or of its unlocked landmarks where its outline is not drawn yet, and an area with neither has no name on the map; an area no unlocked statue stands in is blank. The name's size is a share of the same extent, so it reads one size at any scale.
- **The game's chrome sits where the reference puts it.** The close button stands at the top right and the zoom slider down the left, each at its place in the wiki's 1080 high screenshot and drawn in `--unit`. The slider's thumb sits at the zoom the map shows.
- **The map is a screen.** It is the `Map` screen kind, opened by M through the input's `OpenMap` action ([controls](/docs/genshin/controls)) and closed by M, Escape or its own button, as every screen opens and closes ([screens](/docs/genshin/screens)). It holds the world under it as the game's menus do, and the HUD is hidden while it is open.
- **The map pans and zooms.** A drag moves the view by the metres its pixels cover at the zoom shown, and a drag that travels more than `MAP_DRAG_THRESHOLD_PIXELS` is no choice of the landmark it ends on. The wheel zooms by `MAP_WHEEL_ZOOM_SHARE` of the slider's track per wheel unit, and a press or drag on the slider sets the zoom where the pointer is, a place past either end of the track taking that end. The zoom runs on a logarithm from `MAP_VIEW_METRES_MIN` to `MAP_VIEW_METRES_MAX` metres across the width, so each step along the track zooms by the same share of the view. The view is one viewBox from the pan and the zoom, so the names, the marks and the pointer keep their size at any scale.
- **The jump list is for the keyboard and a screen reader.** The game shows no list, so the jumps are a visually hidden list beside the map, each landmark a button carrying its area's name and its kind in the game's own words, grouped under its region's name. The drawing itself is hidden from a screen reader, since the list says everything it jumps to. Focus starts on the overlay's close button.
- **Every region, not only those in reach.** The map shows the whole continent, so `useJumpLandmarks` reads every region's data once, through the same `readRegionData` the world's reach uses, and keeps the landmarks whose kind a jump lands at. A region that fails is logged and left off the map.

## The jump

- **The landmarks a jump lands at.** `JUMP_LANDMARK_KINDS` holds the Statue of The Seven alone today, as the game teleports to its statues and waypoints and nowhere else; a tree is never a jump. Only the unlocked ones are offered, as the world's jump list, the map and a revive are given the unlocked landmarks alone ([map unlocking](/docs/genshin/map-unlocking)). Teleport Waypoints join as a landmark kind of their own once the regions' data holds them.
- **A landmark's name is its area's.** Each statue lights one area, so its area's catalogue name is the name a jump goes by, with no name of its own written anywhere.
- **The pose lands in front, facing back.** `computeJumpPose` stands the arrival a fixed distance in front of the landmark, along the way it faces, at a yaw that looks back at it, so the view arrives on what was jumped to, clear of a statue's plinth. The body stands on the ground's height there, read when the jump lands.
- **The world screen jumps.** `WorldScreen` exposes `jumpTo(pose)` and `readCameraPosition()` to its host. A jump closes the map, fades a black veil over the screen, and once the fade ends asks `WorldCharacter` to `place` the body at the pose, facing its yaw with the [follow camera](/docs/genshin/follow-camera) level behind it, then fades back in.

## Parity

The overlay is scored against `map-overlay-jueyun`, the English client's map on M over Jueyun Karst at 1920 by 1080, over its interface layer alone: the pointer, the area names, the close button and the zoom slider, as rectangles of the reference's own pixels (`ParityReference.mask`), with the terrain the game paints masked out. As the build stands the masked score is a mean difference of 60.22% and a FLIP of 0.8864, after the pointer moved to the place the reference shows it (60.29% and 0.8881 before). The score is high because the names are not drawn: the region data gives no area a place, so each name box holds only the reference's terrain. The boxes also keep the terrain between a glyph's strokes, so the figure is an upper bound until the glyphs are traced, and the 2% bar is not yet reachable. The whole-frame 31.37% in the committed report no longer reproduces, since the page's fixture had no wallet for the top bar's Original Resin and crashed until it was given one.

## Key files

| File                                                                  | Role                                                                                                                                             |
| :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/Map/Drawing/Index.vue`         | The one drawing of the catalogue, which both views draw                                                                                          |
| `packages/genshin-world/src/components/Map/Overlay/Index.vue`         | The map on M: the drawing placed on the player, the names, the pointer, the close and zoom chrome, and the Original Resin counter on the top bar |
| `packages/genshin-world/src/components/Map/Overlay/Index.fixture.ts`  | The state the parity page shoots, the player in the Sea of Clouds                                                                                |
| `packages/genshin-world/src/components/Map/JumpList/Index.vue`        | Every jump, grouped by region, as buttons, visually hidden on the overlay                                                                        |
| `packages/genshin-world/src/components/Map/Pointer/Index.vue`         | The player on the map: a disc with a cap pointing the way the view faces                                                                         |
| `packages/genshin-world/src/composables/useJumpLandmarks.ts`          | Every region's landmarks a jump lands at, read once                                                                                              |
| `packages/genshin-world/src/services/map/computeJumpPose.ts`          | Where a jump to a landmark lands, and which way it faces                                                                                         |
| `packages/genshin-world/src/services/map/computeAreaLabels.ts`        | Where each area's name is written                                                                                                                |
| `packages/genshin-world/src/services/map/constants.ts`                | The kinds a jump lands at, the arrival's distance, the view's metres and zoom range, the marks' and names' sizes                                 |
| `packages/genshin-world/src/services/map/computeZoomShare.ts`         | Where a view's metres sit on the zoom slider's track, on a logarithm                                                                             |
| `packages/genshin-world/src/services/map/computeZoomMetresAtShare.ts` | The metres a place on the track shows, clamped at either end                                                                                     |
| `packages/genshin-world/src/services/map/computeWheelZoomMetres.ts`   | The metres after a wheel turn, along the same track                                                                                              |
| `packages/genshin-world/src/components/World/Session/Index.vue`       | Opens the map, fades and places on a jump, and exposes both to its host                                                                          |
| `packages/genshin-world/src/components/World/Character/Index.vue`     | Places the body at a pose, the follow camera level behind it                                                                                     |

## Notes

- **Its looks are provisional.** The map's colours, the marks, the pointer, the list's look and the fade's durations are each marked provisional in their file, until the map's and the teleport's recordings are measured ([roadmap](/docs/genshin/roadmap)). The zoom's range and the wheel's rate are provisional too, until the `world-map.mkv` recording shows the game's levels at the slider's ends and one notch of its wheel.
- **The map's terrain is not drawn.** The game paints its map as art, and that art is kept out of the repository, so the overlay draws only the catalogue's outlines, which are provisional squares for most areas. Its masked score is in Parity above; the terrain and the missing names are the difference, while the chrome is placed from the reference's own pixels.
- **The pointer is off the screen's centre.** The reference shows the player's pointer 45 units right of and 50 under the centre at 1080 high, so the drawing is offset to that place rather than centred on the screen. Provisional until a second map's pointer is read.
- **Not built yet.** The region tag at the bottom right, its exploration progress, the UID line and the domains-only toggle are missing: their words are not in the text dump, so they wait on their text ids rather than being typed by hand. The top bar's floor counter belongs to a feature not yet built, and its resin counter is [Original Resin](/docs/genshin/original-resin)'s, placed provisionally until its recording lands. No reference for the teleport panel has been found, so it is not drawn ([roadmap](/docs/genshin/roadmap)).
- **The jump list is hidden, not removed.** It is kept for the keyboard and a screen reader and is not drawn, because the reference shows no list. Whether it should be shown beside the map is a call for the user.
- **The pointer is shared with the minimap.** Both draw `Map/Pointer`, so the minimap's centre pointer takes the same disc and cap.
- **The arrival is a fixed distance until the game's own arrival points are read.** The game sets a transport point for every statue and waypoint, which the text dump's scene points hold under obfuscated field names; until they are named and fitted, a jump lands a provisional distance in front of the landmark.
- **The fade does not wait on the ground.** A jump far from where the camera stood fades back in as soon as it is placed, and the terrain streams in round it as it does after any flight.

## Sources

- [Teleport Waypoint](https://genshin-impact.fandom.com/wiki/Teleport_Waypoint), Genshin Impact Wiki: fast travel by selecting a waypoint on the map, statues acting as waypoints too.
- [Map](https://genshin-impact.fandom.com/wiki/Map), Genshin Impact Wiki: the map on M, and teleporting from it.
- [Map Stardust in Jueyun](https://genshin-impact.fandom.com/wiki/File:Map_Stardust_in_Jueyun.png), Genshin Impact Wiki: the full-screen map at 1080 high, the reference the chrome and the names are placed against.
- [Game accessibility guidelines](https://gameaccessibilityguidelines.com/full-list/): menus reachable without the play itself.
