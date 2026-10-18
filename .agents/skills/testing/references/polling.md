# Polling

Read when a test waits for something to happen. The ban itself is in `SKILL.md`; this page is what to await instead.

- **Await the real completion signal, never a poll.** The repo-wide ban and its standard are `openspec/specs/architecture/no-polling/design.md`; the API calls it names are lint-enforced, while a hand-rolled check-on-a-timer loop matches no rule and falls to review. Await: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Standard: `openspec/specs/architecture/no-polling/design.md`. To prove a caller awaits its own side effect, gate a double and drain one boundary, and which boundary that is under fake timers, is `references/awaiting-a-double.md`.
