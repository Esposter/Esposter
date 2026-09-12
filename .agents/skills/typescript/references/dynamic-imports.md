# Dynamic Imports

Read when reaching for `await import(...)`, or when a dependency's docs mention `optimizeDeps`. The rule itself is
in `SKILL.md` (never a dynamic import for code-splitting; always a static top-level `import`); this page is why,
and the two exceptions.

**Never `await import(...)` for code-splitting** — always a static top-level `import`. The build already
chunk-splits per component, so a nested dynamic import only hides the dependency and, in dev, defers Vite's
discovery until first use, which can trigger a mid-session re-optimization leaving chunks on stale dep hashes.
Only touch `optimizeDeps` when the dependency's own docs instruct it.

Two exceptions: a library-mandated lazy-loader contract, and a heavy dependency whose only entry point is a
module the app always loads — a codec behind a format map, a devtool behind a settings panel. Per-component
chunking has no boundary to split those at, so the dynamic import _is_ the split, and it says in a comment what it
is keeping out of the eager graph.
