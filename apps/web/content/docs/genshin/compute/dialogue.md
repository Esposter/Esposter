---
title: Compute queue: Dialogue
description: The dialogue box's five states, scored over their backdrop.
---

# Dialogue

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {dialogue-five-states} needs game-exports, parity-page — **Dialogue: the five states scored over their backdrop.** `pnpm -C scripts genshin:parity compare` on each of `dialogue-choices-speaker`, `dialogue-choices-line`, `dialogue-choices-replies`, `dialogue-line` and `dialogue-paimon-line`, bar 2% mean difference per region. Scored over the reference's clean plate (`isBackdrop`): the figures for each state are on [the dialogue page](/docs/genshin/dialogue).

- [ ] `[page]` {dialogue-screen-interface} needs parity-page — **Dialogue screen: a parity-page fixture, then its reference cropped from a wiki still.** Gives `DialogueScreen` an `Index.fixture.ts` beside its `Index.vue` and a `ParityReferenceMap` entry naming a wiki crop of its screen (a wiki still of the dialogue screen, none chosen yet), then runs `pnpm -C scripts genshin:parity compare dialogue-screen-interface` and `pnpm -C scripts genshin:parity approve dialogue-screen-interface`. Writes `packages/genshin-interface/src/components/DialogueScreen/Index.win32.png` once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no fixture or reference exists yet.
