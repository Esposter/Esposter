---
title: Pure-JS exec engine
description: Using a just-bash-style pure-JS interpreter as the sandbox's execution engine.
---

# Pure-JS exec engine

Using a pure-JS interpreter (just-bash style, with WASM Python/JS/sqlite) as the sandbox's execution engine.

**Why not:** The goal is to run **any repo's real toolchain** — `pnpm install`, native postinstalls (sharp, esbuild), arbitrary system binaries. A pure-JS interpreter by design never spawns those: just-bash's own docs state it cannot run system binaries, has no package-manager support, and uses no VM isolation. Reimplementing every command and shipping WASM runtimes for each language is an unbounded treadmill that still fails the native-binary case. The real exec engine must spawn actual processes against an OS-level RAM filesystem under an OS sandbox (the `os` backend). just-bash is kept only as an optional shell parser/builtins layer, never as the engine.
