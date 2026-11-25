# Tasks

The reducer's scenarios run as plain unit tests with no store; the store's run against the tRPC mock server, and the invariants against every state and event at once.

## 1. The machine

- [x] 1.1 Write the state, event and effect unions and `reduceContentSync`. Verify: tests named after the scenarios 'Saves asked for during a save send only the latest once it answers', 'A late row of a device's own earlier save is not adopted', 'A newer row naming the content already held moves the version without a read', 'An edit made while another device's save is adopted stays on screen', 'A save refused as stale offers the choice once the row names the newer version' and 'A failed save leaves the edit on screen as failed' written first and seen failing.
- [x] 1.2 Hold the invariants across every event from every state. Verify: a test named after the scenario 'Preserve every invariant from every state across every event' fails on each mutant of the reducer that breaks one.

## 2. The store

- [x] 2.1 Replace the store's content flags with one machine per opening and a driver running its effects, with `markContentEdited` in place of `unwrittenContentResourceId`. Verify: tests named after the scenarios 'Taking theirs replaces the unsaved edit' and 'A stale version drops the save and offers the choice' pass, with 'A create whose link only the server mints waits for the server' and 'A rapid second click on a like creates only one like' unchanged.
- [x] 2.2 Carry the save state, live edits, resource page parity and notifications designs to the machine. Verify: no page names the stale latch or a refresh for a refused save.
