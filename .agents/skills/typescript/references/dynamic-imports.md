# Dynamic Imports

Read when reaching for `await import(...)`, or when a dependency's docs mention `optimizeDeps`. The rule itself is
in `SKILL.md` (never a dynamic import for code-splitting; always a static top-level `import`); this page is why,
and the two exceptions.

**Never `await import(...)` for code-splitting** — always a static top-level `import`. The build already
chunk-splits per component, so a nested dynamic import only hides the dependency and, in dev, defers Vite's
discovery until first use, which can trigger a mid-session re-optimization leaving chunks on stale dep hashes.
Only touch `optimizeDeps` when the dependency's own docs instruct it, or when a lazily mounted tree is what the optimiser
finds mid-session: `apps/web/configuration/vite.ts` lists the Genshin world's and the login's imports for that, since a
lazy component's own imports are found only as it mounts and each late find re-runs the optimiser.

`no-restricted-syntax` (`packages/configuration/eslint/restrictedSourceSyntaxes.js`) flags `await import(...)` in source;
tests are exempt. Two exceptions: a library-mandated lazy-loader contract, and a heavy dependency whose only entry
point is a module the app always loads — a codec behind a format map, a devtool behind a settings panel, a
character's kit behaviour behind the kit behaviour map. Per-component chunking has no boundary to split those at,
so the dynamic import _is_ the split. Each exception is a `// eslint-disable-next-line no-restricted-syntax -- <reason>`
directly above it, and the reason says what it keeps out of the eager graph (or why the import must be lazy).
