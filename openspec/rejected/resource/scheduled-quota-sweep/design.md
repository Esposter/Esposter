# Scheduled quota sweep

Settling expired storage holds with a scheduled job that wakes every 15 minutes, lists the expired rows, probes each object and charges or releases it.

## Why not

The obvious shape for settling holds is a scheduled job: wake every 15 minutes, list the expired rows, probe each object, and charge or release it. It is the wrong one, and the reasoning generalises:

- **The event already exists.** R2 emits an object-create event with the exact byte count for every write, and the bucket's notification already delivers it to the reconcile queue. Polling for a fact the platform will push is standing compute spent to learn something late.
- **The other half was never an event.** "This hold expired" is not something that happens — it is something that becomes true. Written as a `WHERE` clause it needs nothing to run; written as a job it needs a schedule, a batch cap, a retry policy, and an ordering story against the arrival of object-create events.
- **The race disappears rather than being handled.** With two signals (a persistence-time confirm and an unordered, at-least-once reconcile) a whole state machine of conditional transitions exists purely to survive them arriving out of order. With one signal and a predicate there is no second thing to be out of order with.

The cost of doing it with events instead is one R2 event notification per bucket into a queue the [jobs](../../../changes/archive/2026-11-15-infra-cloudflare-jobs/design.md) design already defines — no new service, one event per upload, and reconciliation latency in seconds rather than up to an hour. What it avoids is a scheduled job, a batch cap, and two object requests per expired row.
