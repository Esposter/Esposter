import type { StrictTransportSecurity } from "#src/models/StrictTransportSecurity";

export const serializeStrictTransportSecurity = (policy: StrictTransportSecurity): string =>
  [`max-age=${policy.maxAge}`, policy.includeSubdomains && "includeSubDomains", policy.preload && "preload"]
    .filter(Boolean)
    .join("; ");
