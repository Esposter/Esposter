# A CI job for the session browser test

A job after `build-packages` that runs the session's browser test, the one `*.browser.test.ts` file a root run leaves out, in the runner image's Microsoft Edge.

## Why not

- **A hosted runner cannot draw the world.** The runner has no WebGPU adapter, so the renderer falls back to the WebGL2 backend, where the world's compute passes use atomic operations that do not compile. The screen never draws, every wait on it times out, and the model packs the test reads are not on the runner. The test runs on the machine, where Edge has the adapter and the game data mirror.
- **It never passed and it cost the longest wait in the workflow.** Each run held a runner for tens of minutes up to about an hour before failing, on every run it completed. A run still going cancelled with the next push, so the push that mattered was often the one it never reported on.
- **Nothing waited on its verdict.** The job was advisory and outside the required checks, so its red gated no merge and no deploy. A check nothing decides on is a courtesy, and this one was never green to read (the `fallacies` skill, `references/undecided-checks.md`).
- **The test is not lost.** It stays beside the session component and runs with `pnpm -C packages/genshin-world test:visual <file> --run`, which is where a change to the session is checked before it lands.
