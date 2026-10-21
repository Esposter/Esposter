# Loading States

Read when a list or a panel is filled by a read. `SKILL.md` has the one-line rule; the gate and the states are here.

- **A list a read fills is loading until a read settles, never empty.** Skeletons in the content's own shape while a read is out and nothing is on screen — the first read, and a sort, filter or scope change that empties the list before it reads again — `UiErrorState` when it failed, and `UiEmptyState` only once a read has settled with nothing. The gate is the read's own state (`readItems`' and an auto search's `isPending` and `isError`, `useAsyncData`'s `status`); an empty state behind `items.length === 0` alone flashes on every read. No lint can tell a read-backed list from a local one, so the design pass asks it of every list.
