# Parity costs

Each step takes seconds, so the loop runs as often as a test would:

- The parity page is up in about a second (see Open).
- Each command runs its own Edge, which [machine efficiency](../../../architecture/machine-efficiency/design.md) says closes with its page. The parity page is served once per checkout: the shared checkout's on port 3011, which `GENSHIN_PARITY_PORT` changes.
- A comparison, shot included, takes a few seconds.
- The visual suite's first screen takes a few seconds, and each further screen a fraction of one.
- A trace at a mark's full 1600-unit resolution takes a second or two.

The startup screen's mean difference is a few hundredths of a percent; the remainder is antialiasing along the edge of the lit marks (`scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, `loading-startup` at 0.03%; see Open).

- **A scene's cost is benched, not guessed.** `bench` draws the screen as fast as the GPU allows rather than at the display's refresh. It prints the frame time's median and slow tenth against the main thread's busy time a frame, which tells a scene held up on the CPU from one held up on the GPU; then the renderer's passes, draw calls and triangles a frame, the objects it draws by kind, and the pipelines, geometries and textures it keeps, which grow from one bench to the next in a scene that leaks them. The page reads them from the renderer the scene hands any host that asks. The login's cloud billboards and its walkway pieces were found as meshes of their own this way: drawing each band as one instanced sprite and the walkway as one batch cut its frame time by more than a third (see Open).

- **A surface's structure is reduced on the GPU.** The surface pass's statistics (each family's luminance variance and its octave bands' detail over the family's pixels) run on the parity page's WebGPU device: each blur is two compute passes, each sum one reduction, and only partial sums come back. The host adds them and combines the two images' statistics. Its CPU reference, `computeStatisticalStructure`, is read by the unit test alone. On the `windrise` pass the reduction took the wall time from minutes to a few, and the colour pass's structure (`scoreLabelSimilarity`) is blurred on the same device (see Open). `compare` keeps its CPU scoring, since its PNG encode and browser launch cost more than the scoring they would save.

## Key files

| File                                                                          | Role                                                                                                                        |
| :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinParity/shared/openSurfaceStatisticsPage.ts`      | The parity page's GPU reductions a surface's statistics are read from, its page opened once per surface                     |
| `packages/genshin-world/parity/surfaceStatistics/computeSurfaceStatistics.ts` | A surface's statistics as WebGPU compute passes: separable blurs, one term pass, one reduction; only partial sums read back |

## Open

- [ ] **The parity timings** — no source yet: the page coming up in about a second, a comparison in a few seconds, the visual suite's first screen, a trace in a second or two, and the Windrise reduction in a few minutes are not in any timing record in the repository.
- [ ] **The startup screen's remainder is antialiasing along the lit marks' edges** — no source yet: no diff image for `loading-startup` was read to show where its remainder sits.
- [ ] **The login's cloud billboards and walkway cut the frame time by more than a third** — no source yet: no bench record from before and after the change is cited or committed.
