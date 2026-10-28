# Follow camera

In the game the camera stays behind the character and orbits a point above it. The player turns it freely and zooms it in and out, and the ground or a wall pulls it in toward the character rather than hiding the character behind them. The world's camera does the same: `genshin-engine`'s `createFollowCamera` orbits the [character controller](../character-controller/design.md)'s body, and the world's `WorldCharacter` runs it (`packages/genshin-engine/src/camera/createFollowCamera.ts`, `packages/genshin-world/src/components/World/Character/Index.vue`).

```mermaid
sequenceDiagram
  participant WC as WorldCharacter (camera priority)
  participant FC as Follow camera
  participant SIM as Fixed-step loop
  participant CL as collision
  participant FO as Floating origin
  WC->>FC: look(input, the body's facing), once a frame
  WC->>SIM: advance(delta): the body's steps read the camera's yaw
  SIM-->>WC: the share of a step left over
  WC->>FC: follow(the body blended by that share, lifted to the pivot)
  FC->>CL: a sphere cast along the arm through the landmarks
  CL-->>FC: how far the arm reaches clear
  FC->>FC: the arm stepped through the ground's heights and the water's level
  FC->>FC: the eye pulled in at once, or eased back out
  FO->>FO: the shift reads where the camera now stands
```

## The orbit

- **A pivot at a share of the body's height.** The eye stands on an arm out from a point above the body's feet, at the share of the body's height where the game's screen centre falls on its characters, along the camera's yaw and pitch, and looks back along it at the pivot, so the camera's quaternion is its yaw and pitch alone. A taller body's pivot stands higher (`packages/genshin-world/src/components/World/Character/Index.vue`), as the game raises its look by body type.
- **The look turns it once a frame.** The pointer, while locked, and the right stick turn the yaw and tilt the pitch, clamped to 80 degrees up from below and 70 down from above (`FOLLOW_CAMERA_MAX_PITCH` and `FOLLOW_CAMERA_MIN_PITCH` in `packages/genshin-engine/src/camera/constants.ts`, `packages/genshin-engine/src/camera/createFollowCamera.ts`), short of the poles, each scaled by its sensitivity setting over the middle of the game's range. The pitch range is provisional until a recording reads the PC client's stop. The camera starts level, its yaw kept from the pose it takes over, since the world's default pose looks straight up and a start from it would fall under the pivot (`packages/genshin-engine/src/camera/createFollowCamera.ts`). The pointer's moves after a lock are read as the [controls](../controls/design.md) page sets out (`packages/genshin-engine/src/input/createInput.ts`). The wheel's notches zoom it within the game's nearest and furthest distance (`packages/genshin-engine/src/camera/createFollowCamera.ts`). The steps of that frame read the yaw it turned to, so a move stays relative to where the player is looking (`packages/genshin-world/src/components/World/Character/Index.vue`).
- **The slope pitch settles a baseline, and the look holds on it.** With the setting on, the pitch's baseline settles each frame on the slope the ground rises or falls at along the eye's side, and the player's look is an offset held on that baseline, so a look up or down is kept rather than settled back to the slope. Reset drops the baseline and the look together (`packages/genshin-engine/src/camera/createFollowCamera.ts`).
- **Reset puts it behind the body.** The middle mouse button or a pad's right stick press, the game's reset, swings it level behind the way the body faces at its default distance from the settings, as a jump from the [map](../map/design.md) does on landing (`packages/genshin-engine/src/input/InputActionBindingMap.ts`, `packages/genshin-engine/src/camera/createFollowCamera.ts`, `packages/genshin-world/src/components/World/Character/Index.vue`).
- **It follows the body between steps.** The body moves in fixed steps and the view once a frame, so the pivot is the body's place blended between its last two steps by how far the frame has come into the next, which the fixed-step loop gives as its share of a step left over (`packages/genshin-engine/src/simulation/createFixedStepLoop.ts`, `packages/genshin-world/src/components/World/Character/Index.vue`). Without the blend a body stepping at a fixed rate stutters against the display's own rate.

## Pulled in

The arm is cleared each frame before the eye is placed. A sphere of the camera's clearance is cast from the pivot along the arm through the landmarks' bounding volume hierarchies ([character controller](../character-controller/design.md)), and the arm is then stepped through the terrain's own height function and the water's level, exact for a height field, until a step stands within the clearance of either. The eye stands at the shorter reach. It is pulled in at once, so nothing ever stands between it and the character, and eases back out at a steady pace once the way clears.

## The pointer and photo mode

A click on the world locks the pointer, as the game hides its cursor in play, and Left Alt lets it go to show the cursor, as the game's Show Cursor does; a lock let go that way does not open the Paimon menu ([controls](../controls/design.md) states the Escape case). The next click takes the pointer again (`packages/genshin-world/src/components/World/Character/Index.vue`, `packages/genshin-world/src/components/World/Session/Index.vue`).

Photo mode, chosen from the Paimon menu, holds the body where it stands and keeps the follow camera on it as an orbit: the look turns the view round the body and the wheel zooms it, within the same range and pitch limits as the follow camera. That range is shared until the game's photo mode range is solved ([follow camera proposal](../../../changes/genshin-follow-camera/design.md)). The world's clock runs on as the game's does in photo mode. Leaving photo mode gives the view back to the follow camera where the orbit left it, the body still standing where it did. Under the tuning panel photo mode hands the view to the [free camera](../free-camera/design.md) instead (`packages/genshin-world/src/components/World/Session/Index.vue`).

## The numbers

The camera's numbers are in `packages/genshin-engine/src/camera/constants.ts`, each one a reading of the game's own data, the [parity](../parity/passes/design.md) rule taking the exact source where one exists:

- **The game's own data** for the field of view and the wheel's nearest and furthest distances. The pitch's limits are not the profile's 89 degrees: they are provisional (see below). The field of view is the one the game sets its world camera to. The limits and the distances are the game's camera profile, a ScriptableObject holding a config for each of its camera modules and one global config, which `pnpm -C scripts genshin:assets camera` exports from the install and prints word by word: the global config's elevation limits, its nearest zoom radius and its furthest radius on foot (`scripts/src/services/genshinAssets/camera/readCameraProfile.ts`). The Settings screen's default distance spans as much as the profile's setting adjustment does and tops out at that furthest radius, so the setting is read in metres of the arm.
- **Recordings** for the pivot: the share of a standing character's height at which the screen's centre falls, read off frames of two bodies, a tall female's under a near-level camera and a medium male's under cameras looking down, whose foreshortening is allowed for. The readings are kept in the character's reference (`packages/genshin-world/src/components/World/Character/Camera.reference.ts`).
- **Provisional**, until a recording of the camera in play measures them: a notch's zoom, the ease back out and the pitch's range. A landmark never pulls the eye in under the minimum distance from the pivot, but the ground or the water's surface under the arm does, so a look up from below can stand the eye at the pivot, inside the body's silhouette: no fade of the character as the camera nears it exists yet (`packages/genshin-engine/src/camera/createFollowCamera.ts`). The camera's sensitivities and default distance are read from `FOLLOW_CAMERA_DEFAULT_SETTINGS` at the game's defaults, which the Settings screen takes as its defaults (`packages/genshin-world/src/services/menu/constants.ts`); its pitch following a slope is the Settings screen's slope-pitch setting (`packages/genshin-world/src/services/menu/getFollowCameraSettings.ts`).

## Decisions

- **The game's data over a solve.** Each number the game's camera profile holds is read from it rather than solved off recordings, since the profile is exact where a solve carries its landmarks' noise. Its fields carry the names an older build's code metadata gives them, laid over the raw words as [game data formats](../game-data-formats/design.md) sets out, and a later build that moves the config makes the reader throw rather than name the wrong words (`scripts/src/services/genshinAssets/camera/parseCameraProfile.ts`).
- **The pivot is a share of the body's height, not a height.** The recordings measure where the screen's centre falls on a character as a share of that character's height, and the game raises its look by body type, so each body's pivot follows its own capsule (`packages/genshin-world/src/components/World/Character/Index.vue`).
- **What the profile holds is modelled only once it is seen in play.** The radius the profile adds at the steepest elevation waits for a recording to show the arm lengthening as the camera looks down ([follow camera proposal](../../../changes/genshin-follow-camera/design.md)), the combat camera's pull comes with combat, and the recentering the game ships switched off is not modelled.

## Key files

| File                                                                        | Its role                                                                                                                                 |
| :-------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-engine/src/camera/createFollowCamera.ts`                  | the orbit: look, zoom, reset, the distance's return to its default, the eye pulled in along the arm, and the pitch settling on the slope |
| `packages/genshin-engine/src/camera/constants.ts`                           | the camera's numbers, the game's and the provisional, and its default settings                                                           |
| `packages/genshin-engine/src/models/camera/FollowCameraSettings.ts`         | the settings the camera reads: its sensitivities, default distance and slope pitch                                                       |
| `packages/genshin-engine/src/collision/createLandmarkCollider.ts`           | the sphere cast along the arm                                                                                                            |
| `packages/genshin-engine/src/simulation/createFixedStepLoop.ts`             | how far into the next step a frame has come                                                                                              |
| `packages/genshin-world/src/components/World/Character/Index.vue`           | runs the camera each frame on the blended body's pivot, returns its distance on combat, and locks the pointer                            |
| `packages/genshin-world/src/components/World/Character/Camera.reference.ts` | every investigation of the camera's numbers, and what is open                                                                            |
| `packages/genshin-world/src/components/World/Session/Index.vue`             | shows the cursor on Left Alt, and holds the orbit on in photo mode                                                                       |
| `scripts/src/services/genshinAssets/camera/readCameraProfile.ts`            | the game's camera profile exported from the install and read                                                                             |
| `scripts/src/services/genshinAssets/camera/constants.ts`                    | the global config's words, each named as the 2022 dummy scripts name it                                                                  |

## Sources

- [Settings](https://genshin-impact.fandom.com/wiki/Settings), Genshin Impact Wiki: not in the cache (see Open), so nothing here cites it.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: not in the cache (see Open), so nothing here cites it.
- [Photo Mode](https://genshin-impact.fandom.com/wiki/Photo_Mode), Genshin Impact Wiki: not in the cache (see Open), so nothing here cites it.
- [Time](https://genshin-impact.fandom.com/wiki/Time), Genshin Impact Wiki: not in the cache (see Open), so nothing here cites it.
- [Fix your timestep!](https://gafferongames.com/post/fix_your_timestep/), Glenn Fiedler: the shown state as a blend of the two latest steps, weighted by what the accumulator has left over.
- [WorldReverse](https://github.com/fengjixuchui/WorldReverse/tree/main/Assets/DummyScripts/Assembly-CSharp), fengjixuchui: the camera profile's classes, its global config's and each module config's fields in declaration order, and the numbers of its camera modules.
- [genshin-utility](https://github.com/lanylow/genshin-utility/blob/main/src/library/src/hooks/hooks.cpp), lanylow: a field-of-view tool that takes the game's own call setting 45 as its world camera's.

## Open

- [ ] **In the game the camera stays behind the character, turns freely, zooms, and is pulled in by a wall rather than hiding the character** — no source yet: the Settings and Controls wiki pages are not in the cache, and no capture of the orbit is checked frame by frame.
- [ ] **The game's sensitivity runs from 1 to 5, and the look turns at its middle** — no source yet: the range is not read from the interface export in the cache.
- [ ] **The Settings screen's pitch follows slopes** — no source yet: the Settings wiki page is not in the cache.
- [ ] **The field of view is 45 degrees, the wheel runs from 1 to 6 metres, and the profile's elevation limit is 89 degrees** — no source yet: the camera export under `{data-root}/genshin-parity/extracted/` is not on disk (that folder has no `camera` folder), and the cached sources do not hold the profile.
- [ ] **The Settings screen's default distance runs from 4.5 to 6.0 metres, topping out at the furthest radius** — no source yet: the Settings wiki page is not in the cache, and the camera profile is not exported.
- [ ] **The middle mouse button and the right stick press are the game's camera reset** — no source yet: the Controls wiki page is not in the cache, and the controls capture is not checked frame by frame.
- [ ] **The game hides its cursor in play, Left Alt is its Show Cursor, and Escape opens the Paimon menu** — no source yet: the Controls wiki page is not in the cache, and the controls capture is not checked frame by frame.
- [ ] **Photo mode is reached from the Paimon menu** — no source yet: the Photo Mode wiki page is not in the cache.
- [ ] **The world's clock runs on in photo mode, as the game's does** — no source yet: the Time wiki page is not in the cache.
- [ ] **The game ships its recentering switched off** — no source yet: the game's camera settings are not checked in the cache.
- [ ] **The game raises its look by body type, so a taller body's pivot stands higher** — no source yet: the two body readings in `packages/genshin-world/src/components/World/Character/Camera.reference.ts` show a near-equal share, which does not establish the game's rule.
- [ ] **The world's camera orbits the character's body as the game's camera does** — no source yet: the Controls wiki page is not in the cache, and the game's camera profile is not exported to read the orbit from.
- [ ] **The wheel's notches zoom the camera within the game's nearest and furthest distance** — no source yet: the Settings wiki page is not in the cache, and the profile's nearest and furthest distances are not exported.
- [ ] **The limits and distances are the game's camera profile, read from the install** — no source yet: the camera profile export is not on disk.
- [ ] **The pivot is the share of a standing character's height at which the screen's centre falls** — no source yet: a measured pivot share from the game's own camera data, which is not exported.
- [ ] **Each number the game's camera profile holds is read from it, and a later build makes the reader throw** — no source yet: the camera profile export is not on disk, so the reader's throw on a later build is not tested.
