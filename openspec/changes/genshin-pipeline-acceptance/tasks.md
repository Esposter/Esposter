## 1. Decoders and the game-running guard

- [ ] 1.1 Commit the reference block counts and the SHA-256 of three exports, from the Windows build and from the macOS build run once with `pnpm -C scripts genshin:animestudio:build`, beside the build, and accept the macOS build only at the Windows counts (the Windows counts need the PC, after genshin-pipeline-provenance task 2.4 and task 3.1). Verify: `checkAnimeStudioParity.test.ts` written first and seen failing, asserting 'The Windows counts are committed beside the build' and 'A Mac build whose counts differ from the Windows counts is refused'.
- [ ] 1.2 Add the macOS branch to the game-running guard as a process check. Verify: `checkIsGameRunning.test.ts` written first and seen failing, asserting 'A block run refuses while the game is running on macOS' and 'A block run proceeds when the game is not running on macOS'.

## 2. Measured values

- [ ] 2.1 Move the glow scales, the other hand-set fit constants and the values measured from captures (the cloud band spreads, the sky colours, the light strengths and the camera path) into measurement files that name each capture and frame, and make the reader refuse an entry with no capture. Verify: `measurements.test.ts` written first and seen failing, asserting 'A measured value names the capture it was read from' and 'A measurement entry with no capture is refused'.

## 3. Owning pages

- [ ] 3.1 Carry the owning pages with the code they describe: the derived assets page and its spec (the producer requirement is replaced), the AnimeStudio macOS page, the hosted game data page, the recoverability page, the scene derivation page, the game text page, and the genshin-data and genshin-parity skills (after genshin-pipeline-provenance task 3.4 and genshin-pipeline-hygiene task 4.3, whose code they describe). Verify: `pnpm -C scripts exec vitest run src/services/openspec src/workspace/openspecLinks.test.ts src/workspace/citations.test.ts` passes.

## 4. Reproduction

- [ ] 4.1 Run the pipeline on a fresh PC and a fresh Mac, each holding the install, and compare the two generated locks (needs the PC and a Mac with the install, after genshin-pipeline-provenance task 3.4 and genshin-pipeline-hygiene task 4.3). Verify: the run's output shows the two lock files are the same file, as 'A fresh pair publishes the same lock from one install' requires.
