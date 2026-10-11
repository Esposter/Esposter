---
title: Compute queue: Wish
description: The wish screen's single pull and its ten results, frame by frame.
---

# Wish

## Queue

- [ ] `[cpu]` {wish-single-pull} needs game-exports, media-engine — **Wish: the single pull's reveal, frame by frame.** `pnpm -C scripts genshin:parity frames "$HOME/Esposter/genshin-parity/captures/yt-uhCW3MZTgL8.mp4" 30 96 24`. Reads the published clip from 96 seconds for 24, the banner, the pull and each single pull's reveal. The clip is in `captures` as `yt-uhCW3MZTgL8.mp4`. Writes 720 stills and a contact sheet under `~/Esposter/genshin-parity/frames/yt-uhCW3MZTgL8@96/`, outside the repository. Bar: the stills and sheet are written. The pull's animation timings stay provisional on the wish screen until this item's stills are read.

## Waiting

- [ ] `[cpu]` {wish-ten-results} needs game-exports, media-engine — **Wish: a ten's results, frame by frame.** `pnpm -C scripts genshin:parity frames "$HOME/Esposter/genshin-parity/captures/wish-ten.mkv" 60 0 30`. Reads that clip. Writes 1800 stills and a contact sheet under `~/Esposter/genshin-parity/frames/wish-ten@0/`, outside the repository. Bar: the stills and sheet are written. — input missing: ~/Esposter/genshin-parity/captures/wish-ten.mkv
