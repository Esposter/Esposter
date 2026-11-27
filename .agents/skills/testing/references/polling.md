# Polling

Read when a test waits for something to happen. The ban itself is in `SKILL.md`; this page is what to await instead.

- The repo-wide ban and its standard are `openspec/specs/architecture/no-polling/design.md`; the API calls it names are lint-enforced, while a hand-rolled check-on-a-timer loop matches no rule and falls to review. Await: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. A test drains only before an assertion that reads the work's effect: the app's shared setup (`apps/web/shared/test/setup.ts`) drains every test's leftover fire-and-forget after it, so none is written to keep work from running past teardown, and a test that leaves one never settling fails in that hook. To prove a caller awaits its own side effect, gate a double and drain one boundary, and which boundary that is under fake timers, is `references/awaiting-a-double.md`.
