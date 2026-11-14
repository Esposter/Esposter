# Cross-Process Event Bridge

Carry real-time events between processes: a publish boundary that mirrors message, room, role, user-to-room and call events onto a shared channel, a dispatcher on the other side that delivers them to local sockets, and idempotency keys to prevent double-apply.

**Why deferred**

- Each room's, call's and person's live events come from the one Durable Object that holds their sockets, and one object reaches another's sockets by calling it: a room's events reach its online members' tabs through their user objects. The web Worker holds no state and only forwards to the owning object, so fan-out does not depend on how many Worker isolates are running.
- The plumbing (publish boundary, shared channel, dispatcher, per-event idempotency/dedup) is real distributed-systems work that is easy to get subtly wrong.
- It is speculative: it builds fan-out for a scaling event that may never happen.

**Revisit when:** an event has to reach a socket or a consumer that no object can call, such as one outside the Workers. More Worker isolates do not revisit it, since they hold no state.
