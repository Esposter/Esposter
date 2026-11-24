// Web push requests in flight at once. Each one is a request to its own push service, so one per subscription all at
// Once is a socket each: a room's worth of subscriptions is thousands of connections from one function instance.
export const MAX_CONCURRENT_PUSH_SENDS = 100;
// The answers a push service gives for a subscription no push to it can ever reach again: gone or expired (404, 410),
// Or made under another VAPID key (403), which every later push is refused for too. Its browser subscribes afresh on
// Its next visit, so pruning the row never strands a device that is still listening
export const DEAD_PUSH_SUBSCRIPTION_STATUS_CODES: readonly number[] = [403, 404, 410];
