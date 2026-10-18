# Parity visual suite

The visual suite holds approved screens to their own last images. It says nothing about the game, which is what `compare` is for.

- **An approved screen is held by the visual suite.** `pnpm test:visual` renders every screen and every variant from its fixture in Vitest's browser mode and matches it against its own last image, `Index.<platform>.png` and `Index-<variant>.<platform>.png` beside the component, as a test sits beside its code. It is a separate config, so an ordinary test run never starts a browser, and it reads the engine and the interface library from their source, so a change there shows without a build. The same config runs the tests of what only a browser can play: `Game/Opening`'s plays the whole opening, the login's flight included, and checks every handoff, so a screen skipped along the way fails a run rather than a reader's eye. A moving screen is held still for it by its fixture's `stillProps`, which the parity page and the references never read: the login scene's glide held, drawn at a tier whose anti-aliasing does not jitter, with no interface over it, an image an hour, so a light that turns a part's colour shows as an image that moved where a frame's mean score can hide it. An image is approved by `genshin:parity approve` alone, which writes it with `-u` for its one screen once that screen's compare is under the bar: a first run with no image writes it and then fails, so a whole-suite run without `-u` is never how one is written.

## Decisions

- **A screen's image is written by `genshin:parity approve`.** Once a screen's compare clears its bar, `approve` writes its image as the `Index.win32.png` in its component's folder, a variant's as `Index-<variant>.win32.png` beside it, and runs the suite's `-u` for that one screen alone. A screen with no image on disk is not held by the suite.

- **The variant separator is restated in `scripts`, and its one source is still open.** The visual suites join a screen's name to its fixture's variant with the interface's `FIXTURE_VARIANT_SEPARATOR`, and `scripts` restates it as `VISUAL_VARIANT_SEPARATOR` for `approve`. The decision is a workspace dependency from `scripts` on `genshin-interface`, read through a pure `./constants` export, since its root imports Vue components that the scripts runner cannot load. That waits on the install that writes the dependency and the build that writes the export, so the restatement stays until then.

## Key files

| File                                                               | Role                                                                                                |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/parity/screens.visual.ts`                  | The visual suite                                                                                    |
| `scripts/src/services/genshinParity/reference/approveReference.ts` | Approves one screen's image: the compare under the bar, then the suite's `-u` for that screen alone |
| `scripts/src/services/genshinParity/reference/decideApproval.ts`   | The approval decision: a reference on disk, judging the whole screen, scoring under the bar         |

## Sources

- [Visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing), Vitest: `toMatchScreenshot` and where its reference images are kept.
