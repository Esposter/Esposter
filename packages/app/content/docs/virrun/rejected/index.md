---
title: Rejected
description: Ideas virrun decided against — one page per idea with the rationale, so nothing is re-argued.
---

# Rejected

Ideas we decided against. One page per idea with the rationale — check here (and [deferred](/docs/virrun/deferred)) before proposing an idea; never re-argue a decided one.

- [Pure-JS exec engine](/docs/virrun/rejected/pure-js-exec) — a just-bash-style interpreter as the execution engine.
- [Materialize node_modules](/docs/virrun/rejected/materialize-node-modules) — copy the sandbox install onto host disk; can't beat a native install by filesystem physics.
- [CI wall-time gate](/docs/virrun/rejected/ci-walltime-gate) — hard-fail CI on a wall-clock benchmark regression; shared runners are too noisy.
- [Warm daemon](/docs/virrun/rejected/warm-daemon) — a resident sandbox process between invocations.
- [Rust/napi orchestrator](/docs/virrun/rejected/rust-napi-orchestrator) — rewrite virrun's own orchestration in Rust for speed.
- [In-process async vfs runs](/docs/virrun/rejected/vfs-in-process-async) — drain a controlled event loop instead of bailing to native on async results.
- [Hardlink/CAS flush](/docs/virrun/rejected/hardlink-flush) — hardlink the write-back flush instead of byte-copying.
