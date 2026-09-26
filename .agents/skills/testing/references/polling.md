# Polling

Read when a test waits for something to happen. The ban itself is in `SKILL.md`; this page is what to await instead.

- **Polling is banned — CRITICAL, repo-wide** (`expect.poll`, `vi.waitFor`, `vi.waitUntil`, retry-until loops; all but the loops lint-enforced via `no-restricted-properties`). Await the real completion signal: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Standard: `apps/web/content/docs/architecture/no-polling.md`. To prove a caller awaits its own side effect, gate a double and drain one boundary, and which boundary that is under fake timers, is `references/awaiting-a-double.md`.
