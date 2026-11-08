## 1. Measured readings

- [ ] 1.1 Set the notch's zoom and the eye's ease back out from the recording. Verify: tests named after the scenarios 'Turning the wheel one notch moves the eye one step' and 'The eye eases back after a pull-in' written first and seen failing.
- [ ] 1.2 Set the reset's elevation and the pitch limits from the recording's horizon and tilt. Verify: tests named after the scenarios 'Reset returns the camera to the default elevation' and 'Tilting stops at the game's pitch limits' written first and seen failing.
- [ ] 1.3 Solve photo mode's range from its recording. Verify: tests named after the scenarios 'Photo mode's sliders reach their ends' and 'Photo mode's zoom stops at its nearest and furthest' written first and seen failing.

## 2. Wheel limits

- [x] 2.1 Stop the wheel at the game's nearest and furthest distances. Verify: a test named after the scenario 'The wheel stops at the nearest and furthest distances' written first and seen failing.

## 3. Settings

- [ ] 3.1 Read the sensitivity, the default distance and the slope pitch from the Settings screen once its Controls tab exists. Verify: tests named after the scenarios 'Sensitivity from Settings sets the turn speed', 'Zoom, combat or a teleport returns the camera to its default distance', 'Pitch follows the slope when enabled' and 'Pitch stays level when disabled' written first and seen failing. Open: the zoom input never returns the camera to its default distance, so the scenario's zoom case is unbuilt; its delay after a manual zoom is measured on `follow-camera.mkv` (`design.md` Decisions). Combat does, through the Session's enter-combat listener, and so do a reset and a teleport: each calls the follow camera's reset (`packages/genshin-engine/src/camera/createFollowCamera.ts`), and a teleport reaches it through the Character's `place` (`packages/genshin-world/src/components/World/Character/Index.vue`).
- [ ] 3.2 Replace the provisional default settings with the values the Controls tab's export gives. Verify: the scenario 'Sensitivity from Settings sets the turn speed' passes against the exported defaults. Blocked: the Settings screen's export (block `00/04803507.blk`, its slider, toggle, dropdown and page scripts, `design.md` Decisions) holds no range, step or default value, so no game default can be written; the wiki's Settings page is not fetchable here (HTTP 402) and its search snippet gives none either.
