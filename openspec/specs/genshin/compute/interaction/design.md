# Interaction

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {interaction-pill-right} needs game-exports, media-engine, parity-page — **Interaction: the pill's right end and the selection's move, read off a clean pickup.** `pnpm -C scripts genshin:parity compare interaction-prompts-jueyun-chili`, its reference re-cut from `{data-root}/genshin-parity/captures/yt-UBNImta_dWs-prompt-scroll.mp4`, the near one found for `prompt-scroll.mkv`, at 22 seconds: three Jueyun Chili rows over plain grass, the third selected, so the pill's right end stands clear of the scene; at 3.5 seconds the list is scrolled to its last row. Reads that clip and writes nothing; its region's mean difference is the bar, 2%. — missed, its score in the `interaction-prompts-jueyun-chili` row of `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`: the reference is `interaction-prompts-jueyun-chili`, the clean frame at 23 seconds, so `compare interaction-prompts-pickup` keeps its own world-pickup reference, scored in its `interaction-prompts-pickup` row of `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`. What holds it: the pill's ground and rim are drawn from the game's pickup `packages/genshin-interface/src/components/InteractionPrompts/Index.vue`, but the item icon is a grey disc standing in for the Jueyun Chili art (its `.icon` rule, lines 161 to 167 of that file, is a 32-unit circle filled 18% white), and the name's glyphs sit 1 to 2 pixels off the game's; the icon is what the diff lights up, so only the drawn icon moves it further. Waits on the Jueyun Chili item icon, owned by the roadmap's item icon asset ([roadmap](../../../../changes/genshin-roadmap/tasks.md)).

## Sources

- `prompt-scroll.mkv` — a pile with more drops than the list has rows, the wheel run from its first row to its last and back, no caption or camera inset over the list, 20 seconds at most. A near one: https://www.youtube.com/watch?v=UBNImta_dWs at 0–25 s (`{data-root}/genshin-parity/captures/yt-UBNImta_dWs-prompt-scroll.mp4`), the English PC client at 1080p and 59.94 frames a second, no caption or inset: a chest's drops, the list scrolled with F's cap to its last row, Hunter's Bow, by 3.5 s and picked up from the bottom, then three Jueyun Chili rows over plain grass at 21–24 s, the pill's right end clear of the scene. It is from another build, and the wheel is not run back up.

## Open

- [ ] **Interaction: the name's glyphs 1 to 2 pixels off the game's** — no source yet: a measured glyph offset against the game's name, which no record holds; the name's snapshot row (`scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, the `interaction-prompts-pickup` row) holds the region's score only, and a `genshin:parity trace` of the name would settle it.
- [ ] **the pill's ground and rim are drawn from the game's pickup** — no source yet: a frame check of the pill against `{data-root}/genshin-parity/captures/world-pickup.mkv`, which no record holds; `pnpm -C scripts genshin:parity compare interaction-prompts-pickup` must print a reading for the plate's ground and rim, since its row holds the region's 5.07% only. Frames of `{data-root}/genshin-parity/captures/world-pickup.mkv` at 0 to 22 s show the F-prompt pills, but the ground and rim are too subtle to read by eye.
