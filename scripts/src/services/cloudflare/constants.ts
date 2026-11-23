// A stored object runs to several megabytes, so a request to R2 is bounded past the longest of them
export const R2_REQUEST_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// Requests in flight at once to R2 from this machine, across every bucket. Each opens its own connection, and a burst of more
// Than about sixteen new connections times out behind a VPN whose IPv6 has no route, while sixteen kept-alive connections
// Already keep an upload busy
export const R2_MAX_CONCURRENT_REQUESTS = 16;
