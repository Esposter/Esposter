# Settings

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {follow-camera-settings-defaults} needs game-exports, parity-page — **Follow camera: the Controls tab's defaults, read off the interface export.** Reads the Settings screen's Controls tab from the interface export, once `genshin:assets interface` exists; the two sensitivities and the default distance are written to `FOLLOW_CAMERA_DEFAULT_SETTINGS` (`packages/genshin-engine/src/camera/constants.ts`), its provisional comment replaced by how each was read ([follow camera](../../follow-camera/design.md)). Bar: each default equal to the game's shown value. — blocked: `genshin:assets interface` takes only a `DerivedAssetComponent`, none of which is the Settings screen, so no Controls tab is exported; the item also has no command for its write into `constants.ts`.

## Sources

- `menu-settings.mkv` — the Settings screen opened from the side bar with its Graphics tab in view: the Graphics Quality row pressed and its choices shown, then the Audio tab clicked, 30 seconds at most. Found 2026-10-11: https://www.youtube.com/watch?v=5EmJX_RyuY8 at 0–220 s (`captures/yt-5EmJX_RyuY8-menu-settings.mp4`), the English PC client at 1080p and 60 frames a second in 2024, nothing over it but the game's UID: the Graphics tab from about 120 s, the Graphics Quality row's choices at about 121–123 s, the Custom rows' choices to about 175 s and the Audio tab at about 175–180 s. The tab view is also in `captures/yt-uGtyP02Ie2Q-0-40.mp4`.
