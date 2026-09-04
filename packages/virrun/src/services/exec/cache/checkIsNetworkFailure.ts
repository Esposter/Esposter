// Signatures a command emits when it reaches for the network inside the hermetic (network-unshared) cache run: undici's
// "fetch failed", plus the raw socket/DNS errno codes libc and Node surface offline. Specific enough that a match on a
// NON-ZERO cached run reads as a high-confidence "this command needed the network" — so persistWithCache can point the
// User at --no-cache instead of leaving them with the tool's own opaque error (the buried "fetch failed" table in a
// `pnpm outdated` run). A pure test over combined stdout+stderr, so a non-capturing alternation with no groups to name.
const NETWORK_FAILURE_REGEX =
  /fetch failed|getaddrinfo|ENETUNREACH|ENETDOWN|EAI_AGAIN|ENOTFOUND|ECONNREFUSED|ECONNRESET|EHOSTUNREACH|ETIMEDOUT/u;

export const checkIsNetworkFailure = (output: string): boolean => NETWORK_FAILURE_REGEX.test(output);
