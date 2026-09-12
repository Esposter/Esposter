# Re-reading a List After a Push

Read when a store re-reads a list because a push said something arrived, and has to work out which rows are new. This page holds the whole rule; `SKILL.md` keeps the one line that the re-read is the store's.

A delivered push says "something arrived", never what: the tab re-reads the first page and works out which rows
are new. Three rules make that reliable, and the first two come from the list being shared rather than owned by
the push.

- **Compare against the half the push writes, never the merged list.** A surface that renders server rows
  alongside locally-created ones has two halves with different lifetimes; the newest row overall is routinely the
  local one, which has already been acted on. Snapshot the newest **server** row before the read, and act on the
  server rows past it.
- **A timestamp watermark needs the ids alongside it.** Postgres stores microseconds and a `Date` keeps
  milliseconds, so two rows written inside the same millisecond arrive with **equal** timestamps and a strict
  `>` drops the second one for good — it is not newer, and no later read will ever call it new again. Compare
  `>=` and exclude the ids the tab already held: the ids settle the ties, and the watermark still stops a page
  that simply grew (a tab holding fewer rows than a page) from replaying a backlog nobody was pushed.
- **Queue the re-reads, never run them side by side.** Both comparisons snapshot the list _before_ the read and
  test against it _after_, so two pushes landing together snapshot the same list and both claim the row the first
  read brought back. Put the whole snapshot-read-compare through `executeMutation` under one key — its per-key
  queue is what makes the second call read a list that already holds that row. Joining the in-flight read instead
  (`isExclusive`) is the wrong shape here: a row written after that read was issued would never arrive.

All three belong in the **store**, not the plugin or component that receives the push: only the owner of the list can
tell its halves apart, and the receiver's job is to hand over the read.
