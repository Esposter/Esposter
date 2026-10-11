# The parity page and its renderer

Read when a command renders the world, a frame stalls, or the parity page is served. The one-line rules are in `SKILL.md`; this page is their reasoning.

- **A command that renders the world takes a run slot.** `passes`, `compare`, `stalls` and any other command that opens Edge on a world page runs through `bash .agents/skills/throughput/scripts/run-in-slot.sh`, since each renderer holds about 2.5 GB: three agents' world passes at once took free memory to 1.6 GB on 2026-10-09, and the slot's memory gate and its one start a minute keep them from landing together.

- **A stall is named from `stalls --trace` before anything is fixed.** A slow frame whose page GPU calls total under a millisecond is not a compile: its main thread sat in a native call (a `writeBuffer` or a `createCommandEncoder`, the GPU backlog) or in the page's own code, which the trace's CPU samples name. Its rendering-side causes and numbers are in `apps/web/content/docs/genshin/rendering-style.md`.

- **The parity page of the shared checkout is served once for the wave on port 3011, and the tool `pnpm -C scripts genshin:parity`, run through `tsx` for its enums, reaches it by default, and each command launches its own Edge.** The main session starts the page hidden from the repo root (`pnpm -C packages/genshin-world exec vite --config parity/vite.config.ts --port 3011 --strictPort`). A runner's worktree serves its own page on 3002 with `GENSHIN_PARITY_PORT=3002`.
