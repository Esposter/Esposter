---
title: Compute queue: Paimon
description: The Paimon menu's runs: the quit prompt fitted to its whole frame, the menu's open and close timed, and the reputation reward page compared against its frame.
---

# Paimon

## Queue

- [ ] `[page]` {paimon-menu-open} needs game-exports, media-engine, parity-page — **Paimon: the menu's open and close, timed.** The menu has no transition yet, so it opens and closes at once. `pnpm -C scripts genshin:parity frames "$HOME/Esposter/genshin-parity/captures/yt-IegFADn-Lmk-menu-paimon.mp4" 60 35 2` over the opening, the HUD fading from about 35.3 seconds and the panel in by about 36.3, and the same at `60 109 2` over the closing, from about 109.5 to 110.5; the timing and easing they read go in the Paimon section's constants with how they were measured. The clip is the English PC client's at 60 frames a second, with a caption along the bottom and the uploader's black box over the name card.

## Waiting

- [ ] `[page]` {paimon-quit-prompt} needs game-exports, media-engine, parity-page — **Paimon: the quit prompt fitted to its whole frame.** Waits on `menu-quit-prompt.mkv`, the current prompt with its three buttons; the one whole frame found, `captures/yt-kIDee7nyD0w-menu-quit-prompt.mp4` at 26 to 28 seconds, is the 2024 build's prompt with two. Once it lands, the prompt's button tops, widths, disc and icon places in `Menu/Exit/Index.vue` are read off that frame's pixels, replacing the 1080 high unit the crop is held to, and the wiki's crop becomes a reference only for its colours. Bar: the frame's mean difference at or under 2%, with the reference registered in `ParityReferenceMap` as the whole frame.
- [ ] `[page]` {reputation-screen} needs parity-page — **Reputation: the reward page compared against its 18-second frame.** `pnpm -C scripts genshin:parity compare reputation-screen`, its reference `references/reputation-screen/18s.png` from `captures/yt-1SqmdXbIhLs-reputation-guide.mp4`. Its measure: the level list's rows, marks and item slots scored over the panel, with the reward icons and the unlock lines still to draw. — Run 2026-10-11 on the runner's page: mean difference 6.13%, shape 0.380, tone 5.39%, FLIP 0.2658, the grid's second column reading 11.7 to 14.6% where the others read 0 to 7%. The line states no numeric bar, and the reward icons and unlock lines it names are not drawn, so the list cannot be read against its measure yet; waits on them.
