# The bench is the only speed gate

Read when about to time something with `time` or a `performance.now()` loop, or to assert how fast something runs inside a test. The rules themselves are in `SKILL.md`; this page is why each alternative loses.

## A stopwatch is a probe, never an answer

A session wanting to know how long something takes reaches for `time` or a `performance.now()` loop, reads the
number, and moves on — and the number dies with the turn, so the next session times it again, on another host, and
compares two stopwatch readings that agree on nothing. **The number a session would quote, compare or re-check lives
in a committed `*.bench.md`, and nowhere else.** An ad-hoc timing is allowed for one thing: locating where inside a
run the time goes before a bench is written — which phase, which spawn, which read — and what it finds becomes a
bench or is dropped. A timing loop run twice on the same question is the bespoke script `references/what-to-bench.md` refuses,
whether it lives in a file or in a shell history.

## No `.speed.test.ts`

Speed regressions are caught by regenerating and diffing the colocated `*.bench.md`, never by timing assertions in the unit suite. Do **not** add `*.speed.test.ts` files that spawn a baseline and `expect(ratio).toBeGreaterThan(...)`: it duplicates the bench, flakes on a loaded host, and slows `pnpm test`. The bench already measures it — a hot path that silently falls back to native collapses its `vs base` toward `1.00×`. Correctness gates asserting output parity _are_ tests; only speed lives in the bench.
