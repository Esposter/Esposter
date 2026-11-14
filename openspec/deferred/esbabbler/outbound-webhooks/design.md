# Outbound Webhooks

Register HTTP endpoints per room; on configurable events (new message, pin, etc.) enqueue a job whose queue handler in the functions Worker POSTs to each endpoint, retried by its queue up to the job's retry count.

**Why deferred**

- Developer/power-user feature; low ROI for a casual social platform.
- Posting to user-supplied URLs is an SSRF/abuse surface (same risk family as remote URL fetches).

**Cheaper interim:** none of this needs new infrastructure — every building block is already in code: the queue job pattern the inbound webhook already runs on (`QueueJob.ProcessWebhook`, with its own retry count and dead-letter queue), the room object's alarm that sends scheduled messages, the `RoomPermission.ManageWebhooks` gate, and the inbound webhook model (`webhooksInMessage`, `appUsersInMessage`, tokens).

**Revisit when:** there is clear integration/automation demand. Remaining work is an outbound config (URL + event subscriptions), an emit→enqueue hook, a POST-with-retry queue handler as a `QueueJob` like the others, and an SSRF/abuse review of the destination URLs — the same pattern, not new infrastructure.
