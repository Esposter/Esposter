# Parity costs

Each step takes seconds, so the loop runs as often as a test would:

- The parity page is up in about a second (see the [spec](spec.md)).
- Each command runs its own Edge, which closes with its page ([machine efficiency](../../../architecture/machine-efficiency/design.md), `scripts/src/services/genshinParity/shared/openParityPage.ts`). The parity page is served once per checkout: the shared checkout's on the `PARITY_DEFAULT_PORT` in `scripts/src/services/genshinParity/shared/constants.ts`, which `GENSHIN_PARITY_PORT` changes (`packages/genshin-world/parity/vite.config.ts`, `scripts/src/services/genshinParity/shared/constants.ts`).
- A comparison, shot included, takes a few seconds.
- The visual suite's first screen takes a few seconds, and each further screen a fraction of one.
- A trace at a mark's full 1600-unit resolution takes a second or two.

- **A scene's cost is benched, not guessed.** `bench` draws the screen as fast as the GPU allows rather than at the display's refresh. It prints the frame time's median and slow tenth against the main thread's busy time a frame, which tells a scene held up on the CPU from one held up on the GPU; then the renderer's passes, draw calls and triangles a frame, the objects it draws by kind, and the pipelines, geometries and textures it keeps, which grow from one bench to the next in a scene that leaks them (`scripts/src/services/genshinParity/commands/benchCommand.ts`). The page reads them from the renderer the scene hands any host that asks (`packages/genshin-world/src/services/scene/SceneContextKey.ts`). The login's cloud billboards and its walkway pieces are drawn as one instanced sprite per band and one batch for the walkway, since a mesh of its own per piece costs frame time that `bench` reports (see Open).

- **A surface's structure is reduced on the GPU.** The surface pass's statistics (each family's luminance variance and its octave bands' detail over the family's pixels) run on the parity page's WebGPU device (`packages/genshin-world/parity/surfaceStatistics/computeSurfaceStatistics.ts`, `scripts/src/services/genshinParity/shared/openSurfaceStatisticsPage.ts`): each blur is two compute passes, each sum one reduction, and only partial sums come back. The host adds them and combines the two images' statistics (`scripts/src/services/genshinParity/passes/computeStructureError.ts`). Its CPU reference, `computeStatisticalStructure`, is read by the unit test alone (`scripts/src/services/genshinParity/passes/computeStatisticalStructure.test.ts`, `scripts/src/services/genshinAssets/fit/computeTextureDetail.test.ts`). On the `windrise` pass the reduction brings the wall time down to a few minutes, and the colour pass's structure (`scoreLabelSimilarity`) is blurred on the same device (`packages/genshin-world/parity/surfaceStatistics/computeLabelSimilarity.ts`, whose CPU reference, `scripts/src/services/genshinParity/witness/scoreLabelSimilarity.ts`, names the page as the one that computes it on its GPU). `compare` keeps its CPU scoring, since its PNG encode and browser launch cost more than the scoring they would save (`scripts/src/services/genshinParity/reference/compareScreen.ts`).

## Key files

| File                                                                          | Role                                                                                                                        |
| :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinParity/shared/openSurfaceStatisticsPage.ts`      | The parity page's GPU reductions a surface's statistics are read from, its page opened once per surface                     |
| `packages/genshin-world/parity/surfaceStatistics/computeSurfaceStatistics.ts` | A surface's statistics as WebGPU compute passes: separable blurs, one term pass, one reduction; only partial sums read back |

## Open

- [ ] **The login's cloud billboards and walkway cut the frame time by more than a third** — no source yet: no bench record from before and after the change is cited or committed.
- [ ] **`compare` keeps its CPU scoring, since its PNG encode and browser launch cost more than the scoring they would save** — no source yet: its PNG encode and browser launch timings are not yet measured.
