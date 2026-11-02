import { createRateLimiter } from "#server/services/rateLimiter/createRateLimiter";

// The aggregate budget for an anonymous request to a route that answers before it knows its caller: a webhook url
// Whose id matches no webhook, and an MCP request whose key matches no key. Neither names a row the route can budget
// Against without first looking it up, so the address is the one key the caller does not choose. It is built the way
// The asset budget is: a shared egress address carries every caller behind it, so the budget sits far above one
// Caller's traffic, and the sliding window lets an address recover on its own rather than locking it out
export const addressRateLimiter = createRateLimiter({ keyPrefix: "Address", points: 10_000 });
