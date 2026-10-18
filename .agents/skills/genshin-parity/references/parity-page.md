# The parity page and its renderer

Read when a command renders the world, a frame stalls, or the parity page is served. The one-line rules are in `SKILL.md`; this page is their reasoning.

- **A command that renders the world is a plain run, bounded by the session that starts it.** `passes`, `compare`, `stalls` and any other command that opens Edge on a world page runs as a plain `pnpm -C scripts genshin:parity …` command, since each renderer holds about 2.5 GB and parallel renders exhaust free memory. Do not run world passes in parallel, so the session starting agents keeps world renders from landing together.

- **A stall is named from `stalls --trace` before anything is fixed.** A slow frame whose page GPU calls total under a millisecond is not a compile: its main thread sat in a native call (a `writeBuffer` or a `createCommandEncoder`, the GPU backlog) or in the page's own code, which the trace's CPU samples name. Its rendering-side causes and numbers are in `openspec/specs/genshin/rendering-style/design.md`.

- **The parity page of the shared checkout is served once for the wave on port 3011, and the tool `pnpm -C scripts genshin:parity`, run through `tsx` for its enums, reaches it by default, and each command launches its own Edge.** The main session starts the page hidden from the repo root (`pnpm -C packages/genshin-world exec vite --config parity/vite.config.ts --port 3011 --strictPort`). A runner's worktree serves its own page on 3002 with `GENSHIN_PARITY_PORT=3002`.
