# Subscriptions Written on Another Member's Behalf

Read when one member's action subscribes another — following a thread for a reply's root author — or an opt-out is recorded.

Discord parity means a member's action routinely subscribes _another_ member — replying to a message follows that thread for its root's author too (`apps/web/content/docs/esbabbler/thread-follows.md`). Two rules fall out, and both are about the row, not the caller:

- **Deleting the row on opt-out makes "never subscribed" and "opted out" the same absence**, so the next third-party action re-subscribes them and the opt-out can never stick. Record the decision on the row instead (`threadFollowsInMessage.isUnfollowed`) and filter it out of every read. Whether a write may clear that tombstone is decided by **whose action it is** — the member's own (the bell, their own reply) clears it, anyone else's only ever inserts.
- **The other member may not exist.** A webhook message has no `userId` at all, so any id lifted off a message entity is guarded on presence before it reaches a `NOT NULL` column — the whole best-effort tail is swallowed into `console.error`, so the constraint violation costs the operator a stack trace per message and nothing else surfaces.
