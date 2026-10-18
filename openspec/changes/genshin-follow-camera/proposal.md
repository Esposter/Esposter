# Follow camera

## Why

The follow camera stands behind the character and orbits it, with its wheel's nearest and furthest distances, its field of view and its pivot taken from the game. Its notch's zoom, its ease back out, its reset's elevation, its pitch limits and the settings that set its sensitivity and default distance are still provisional, and photo mode orbits within the follow camera's range rather than its own. Until those readings are taken the camera does not move as the game's does.

## What Changes

The camera's wheel, ease, reset, pitch and settings follow the game's measured values, and photo mode follows its own solved range.

- Each wheel notch moves the eye by the measured step, and the wheel stops at the game's nearest and furthest distances.
- After a pull-in the eye eases back out at the measured rate.
- A reset levels or tilts the camera to the game's default elevation, and tilting stops at the game's pitch limits.
- The camera's sensitivity and default distance come from the Settings screen, and it returns to its default distance after a zoom, combat or a teleport.
- Its pitch follows the slope when Settings turns that on.
- Photo mode's sliders and zoom move the camera within the game's range.

## Capabilities

- **genshin/follow-camera** (modified)

## Waiting on

- `openspec/changes/genshin-menu-settings/`: the camera's settings rows, and the defaults the camera starts at.
- The Settings Controls tab, which waits on the interface export.
- The recordings `follow-camera.mkv` and `photo-mode-range.mkv`, which set the notch, the ease, the reset, the pitch limits and photo mode's range. Until they land those values stay provisional.

## Impact

The engine's follow camera gains the measured notch, ease and reset, and the world's character camera reads the settings. The Settings screen supplies the sensitivity, distance and slope pitch, and photo mode's camera takes the solved range. Combat's cameras, the boat's camera, the cameras of cutscenes and photo mode's own screen are not part of this change.
