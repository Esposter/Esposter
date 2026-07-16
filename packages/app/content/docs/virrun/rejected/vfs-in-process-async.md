---
title: In-process async vfs runs
description: Drain a controlled microtask/timer loop so async pure-JS runs stay on the no-spawn vfs path instead of bailing to native.
---

# In-process async vfs runs

Drain a controlled microtask/timer loop inside `runNodeInProcess` so async pure-JS `node -e`/`node <file>` can run on the no-spawn `vfs` path instead of bailing to native on any `Promise` result.

**Why not:** Marginal value, real correctness risk, doesn't extend naturally. Today `runNodeInProcess` bails to native the moment a run returns a `Promise`, so the in-process path only catches trivial sync `node -e`. Spinning a controlled event loop would only save node-boot (~50–100ms) over the already-shipped `os` fork — and it's gated hard by the differential-correctness suite, which a half-real event loop is liable to break: unhandled rejections, timer leaks, and require-cache bleed across runs all diverge from a real `node` process in ways the gate must catch. The `os` backend already runs async tools faithfully and isolated.

Revisit only if a profile shows pure-JS async invocations are a frequent, hot slice of a real loop **and** a spike proves a drained-loop runtime holds the differential gate (rejections, timers, require-cache isolation) — spike-first, gate-green before any production wiring.
