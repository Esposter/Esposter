# A Room-Scoped Store's Writes

Read when a guard is about to be written at each call site of a keyed store, or the ladder needs a worked case: the remembered version against the structural one.

Room-scoped Pinia slices are keyed by the room on screen, so `items` and `members` read whichever room that is.
That is what a rendering component wants and exactly what a **write** must never use: a response that lands after
the reader opened another room would be filed under the room they are now looking at.

A remembered version — an `if (checkIsFoo(roomId))` in every callback — ends up present in one store,
absent in its neighbour, with nothing failing — which is the whole argument. The structural version has no check
anywhere: the write functions are reachable only through `getSlice(roomId)` / `getRoomOperationData(roomId)`,
so naming the room is how you obtain a writer at all, and a response cannot be filed anywhere but its own slice.
The convention itself is the `pinia` skill's (`references/keyed-state-and-pagination.md`).

Note what the structural version also bought: a late response now lands in **its own** room's slice, so
re-opening that room shows what was read rather than re-fetching it. The guard could only ever drop the write —
correct, but strictly less than correct-and-useful. A rung up the ladder usually pays twice.
