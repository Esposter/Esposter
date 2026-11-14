// Web push requests in flight at once. Each one is a request to its own push service, so one per subscription all at
// Once is a socket each: a room's worth of subscriptions is thousands of connections from one function instance.
export const MAX_CONCURRENT_PUSH_SENDS = 100;
