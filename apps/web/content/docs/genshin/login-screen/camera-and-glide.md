# Camera and glide

The login camera holds one pose, and the world glides toward it. The walkway, its towers and the cloud sea move past the camera at the game's pace, the door comes to rest at the walkway's far end, and the glide's position at each moment is the title's and the flight's clock.

## How it works

- **The camera's pose is the game's.** The eye stands and turns exactly as the game's `ModelCamera` does: straight down the walkway's middle along +z, pitched 5.69 degrees up. Its height is set by the walkway's own lift. Every block of the walkway rises 5 metres into place on its own animator (`Ani_Login_Lift`) while the camera and the towers keep their laid places, so the towers stand 5 metres under the walkway and `ModelCamera`'s 6 metres put the eye 1 metre over it. The eye's distance and rest are read from the record (`computeLoginCameraZ`, `computeLoginCameraHeight`).
- **The field of view follows the screen's width.** The vertical field of view is the game's 45 degrees on a screen 18.5:9 or wider. On a narrower one it is the field that shows as wide a view across as 18.5:9 does, 51.2 degrees at 16:9 (`getLoginCameraFov`). At 21.5:9 the solved eye lands the door within a pixel and a quarter of the recording's door.
- **The glide's frames refine to the same pose from every start.** The pitch, the height and the field of view are the same wherever the glide starts along the walkway, so the camera never moves. What moves is the scene's rows.
- **The rows wrap by their own lengths.** `MonoLoginScene` lays each row out ahead of its own place and wraps it by its length (the hosted `login/scroll` record): the walkway's three copies 16 metres apart, its own length; the towers and their bridges three 200 metres apart; and the cloud sea's billows and low clouds by their two 300 metres apart.
- **The glide's pace is the script's, timed by the walkway's repeats.** The glide runs at 3.5 metres a second while the title waits and at 4.5 once the game prepares, the two speeds in `services/login/scene/constants.ts`. A row of a recording is one distance ahead whatever the camera's pose, so the wings' edges crossing a column of it a copy apart, 16 metres, time the pace to a few thousandths (`genshin:parity glide`). The current build's title reads about 3.5 metres a second, and a repeat already braking toward the door about 4.35. Between the two speeds the glide gathers or loses speed at 0.63 metres a second each second, the recording's slope toward the door. At the door it keeps on to the first copy that both stands the door past the walkway's far end and can be stopped on at that rate, then slows to rest exactly there (`advanceLoginGlide`).
- **The door comes to rest with the towers' row 144 metres along its loop.** Every door frame shows the big lantern tower close to the door's right and the colonnade low behind it. The recordings idle the title only a few seconds, so the frames' tower phase is set by the recording the glide is judged against: the current build's door frame stands the towers 120 metres along, so that frame is held there (`heldScrolled` 320, on the same walkway phase). A scene mounted at the door stands there. The title opens about 49 metres short of the door, the English recording's glide from the title to the door's rest, on the walkway's phase the dawn frame stands it at (`computeLoginGlideTitleScrolled`).
- **The towers' row stands where the blocks lay it.** The row (its towers, bridges and pillars as one) keeps its laid place while the walkway rises 5 metres, so beside the risen walkway it stands 5 metres lower. The bridge whose deck crosses the glide's path passes under the walkway, as the game's glide passes over it however long the title idles. Across the path the row stands where the exports lay it: the current build's door frame lands its edges within 0.03 metres of there. Along the glide it stands 8.94 metres nearer, the phase the older door frame showed it at.

## Tests

- `advanceLoginGlide.test.ts` holds the glide's pace changes to its acceleration, its rest to a whole number of the walkway's copies, and the door to first standing past the walkway's far end.
- `getLoginCameraFov.test.ts` holds the field of view to the width rule above.
- The row's test holds the camera's path, and a metre either side of it, open through the towers and the bridges' hulls from end to end.

## Key files

| File                                                                                | Role                                                                               |
| :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/Login/Scene/Index.vue`                       | The camera, the glide, the rows and their wrap                                     |
| `packages/genshin-world/src/services/login/scene/constants.ts`                      | The camera's eye and rest, the glide's speeds, the haze, the light and the shadows |
| `packages/genshin-world/src/services/login/scene/advanceLoginGlide.ts`              | The glide a frame on, and its rest at the door                                     |
| `packages/genshin-world/src/services/login/scene/computeLoginGlideTitleScrolled.ts` | The moment of the loop the title opens at, on the walkway's row                    |
| `packages/genshin-world/src/services/login/scene/computeLoginCameraHeight.ts`       | The eye's height over the walkway, read from its record                            |
| `packages/genshin-world/src/services/login/scene/computeLoginCameraZ.ts`            | The eye's place along the walkway, read from its record                            |
| `packages/genshin-world/src/services/login/scene/getLoginCameraFov.ts`              | The vertical field of view for a screen's width                                    |
| `packages/genshin-world/src/services/login/door/getLoginDoorPosition.ts`            | Where the door stands on the walkway's far end                                     |
