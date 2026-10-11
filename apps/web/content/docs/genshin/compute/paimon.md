---
title: Compute queue: Paimon
description: The Paimon menu's runs: the quit prompt fitted to its whole frame, the menu's open and close timed, and the reputation reward page compared against its frame.
---

# Paimon

## Queue

## Waiting

- [ ] `[page]` {paimon-quit-prompt} needs game-exports, media-engine, parity-page — **Paimon: the quit prompt fitted to its whole frame.** Waits on `menu-quit-prompt.mkv`, the current prompt with its three buttons; the one whole frame found, `captures/yt-kIDee7nyD0w-menu-quit-prompt.mp4` at 26 to 28 seconds, is the 2024 build's prompt with two. Once it lands, the prompt's button tops, widths, disc and icon places in `Menu/Exit/Index.vue` are read off that frame's pixels, replacing the 1080 high unit the crop is held to, and the wiki's crop becomes a reference only for its colours. Bar: the frame's mean difference at or under 2%, with the reference registered in `ParityReferenceMap` as the whole frame.
- [ ] `[page]` {reputation-screen} needs parity-page — **Reputation: the reward page compared against its 18-second frame.** `pnpm -C scripts genshin:parity compare reputation-screen`, its reference `references/reputation-screen/18s.png` from `captures/yt-1SqmdXbIhLs-reputation-guide.mp4`. Its measure: the level list's rows, marks and item slots scored over the panel, with the reward icons and the unlock lines still to draw. — waits on the reward icons and the unlock lines, which are not drawn yet, so the list has no measure to read against.

## Reference

- `menu-quit-prompt.mkv` — Quit Game pressed in the side bar, the exit prompt's three buttons in view and each hovered once, 15 seconds at most; its frame's scale is what the one still held lacks. Searched 2026-10-11 on the wiki, YouTube and Bilibili with "genshin impact how to exit game PC", "genshin impact quit game paimon menu", "genshin impact exit game button PC paimon menu logout", "genshin impact 'exit to desktop' continue game", "genshin impact exit to login interface", "genshin impact how to quit game 2025", "genshin impact how to log out PC 2025", "genshin impact switch account PC 2026", "genshin impact exit to desktop button" and "原神 退出游戏 返回登录界面", none found with the current three buttons. The nearest is https://www.youtube.com/watch?v=kIDee7nyD0w at 26–28 s (`captures/yt-kIDee7nyD0w-menu-quit-prompt.mp4`), the 2024 build's prompt with two buttons, a whole frame at 1080p and 30 frames a second.
