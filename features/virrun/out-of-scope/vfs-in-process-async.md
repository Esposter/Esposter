Drain a controlled microtask/timer loop inside `runNodeInProcess` so async pure-JS `node -e`/`node <file>` can run on the no-spawn `vfs` path instead of bailing to native on any `Promise` result.

## Why not

Marginal value, real correctness risk, doesn't extend naturally. Today `runNodeInProcess` bails to native the moment a run returns a `Promise` ("an async result needs an event loop we will not spin"), so the in-process path only catches trivial _sync_ `node -e`. Spinning a controlled event loop in-process would only save node-boot (~50–100ms) over the already-shipped `os` fork — and it's gated hard by the differential-correctness suite, which a half-real event loop is liable to break: unhandled rejections, timer leaks, and require-cache bleed across runs all diverge from a real `node` process in ways the gate must catch. The `os` backend already runs async tools faithfully and isolated; the only thing in-process async adds is shaving node-boot off the narrow slice of pure-JS async tools, at the cost of reimplementing a node event loop's observable semantics well enough to pass differential.

## Revisit when

A profile shows pure-JS async `node -e`/`node <file>` invocations are a frequent, hot slice of a real `virrun --` loop AND a spike proves a drained-loop runtime holds the differential-correctness gate (rejections, timers, require-cache isolation) — spike-first, gate-green before any production wiring.
