---
title: Parity visual suite
description: Every approved screen is held by a visual suite whose images live beside its component, and the suite's own runs cover the opening's handoffs.
---

# Parity visual suite

The visual suite holds approved screens to their own last images. It says nothing about the game, which is what `compare` is for.

- **An approved screen is held by the visual suite.** `pnpm test:visual` renders every screen and every variant from its fixture in Vitest's browser mode and matches it against its own last image, `Index.<platform>.png` and `Index-<variant>.<platform>.png` beside the component, as a test sits beside its code. It is a separate config, so an ordinary test run never starts a browser, and it reads the engine and the interface library from their source, so a change there shows without a build. The same config runs the tests of what only a browser can play: `Game/Opening`'s plays the whole opening, the login's flight included, and checks every handoff, so a screen skipped along the way fails a run rather than a reader's eye. A moving screen is held still for it by its fixture's `stillProps`, which the parity page and the references never read: the login scene's glide held, drawn at a tier whose anti-aliasing does not jitter, with no interface over it, an image an hour, so a light that turns a part's colour shows as an image that moved where a frame's mean score can hide it. `-u` approves what the screens draw now. A new image's first run writes it and fails once, which is Vitest's way of asking for that approval.

## Key files

| File                                              | Role             |
| :------------------------------------------------ | :--------------- |
| `packages/genshin-world/parity/screens.visual.ts` | The visual suite |

## Sources

- [Visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing), Vitest: `toMatchScreenshot` and where its reference images are kept.
