export const CLOUDFLARE_WORKLOAD = "esposter";
// The one Cloudflare account both stacks, both Workers and the cutover deploy into. An account id is not a secret (the
// dashboard URLs carry it), so it is committed rather than read from an environment or Pulumi config
export const CLOUDFLARE_ACCOUNT_ID = "33d16cc4281c2845398ddb2fbd29829b";
// The window every rate limit is spent in, in seconds. A Workers rate limit binding takes a period of 10 or 60 seconds only, and
// every budget here is a minute, so one value serves them all
export const RATE_LIMITER_DURATION_SECONDS = 60;
