import type { OptionParity } from "#src/models/OptionParity";

import { OptionParityVerdict } from "#src/models/OptionParityVerdict";

// Every upstream option with one verdict. A ported row names our option, and a changed default's note names the source
// Its default cites, as `defaults-review.md` does. `headers` itself is ported with changed defaults, and each of its
// Keys carries its own row
export const OPTION_PARITY: OptionParity[] = [
  {
    note: "Upstream's default is `methods: '*'`, which refuses no method, so a default-on handler only adds per-request work. Ours is off, and the cost is measured on the module page",
    ours: "allowedMethodsRestricter",
    upstream: "allowedMethodsRestricter",
    verdict: OptionParityVerdict.ChangedDefault,
  },
  { note: "Same default: off", ours: "basicAuth", upstream: "basicAuth", verdict: OptionParityVerdict.Ported },
  {
    note: "Same default: off",
    ours: "contentSecurityPolicyReportOnly",
    upstream: "contentSecurityPolicyReportOnly",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: the development server's origin, the same methods and a `204` preflight",
    ours: "corsHandler",
    upstream: "corsHandler",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: off. Ours is the double submit cookie of the OWASP CSRF Prevention Cheat Sheet, not upstream's `nuxt-csurf` module",
    ours: "csrf",
    upstream: "csrf",
    verdict: OptionParityVerdict.Ported,
  },
  { note: "Same default: on", ours: "enabled", upstream: "enabled", verdict: OptionParityVerdict.Ported },
  {
    note: "Its keys carry the changed defaults: see `headers.contentSecurityPolicy`, `headers.permissionsPolicy` and `headers.strictTransportSecurity`",
    ours: "headers",
    upstream: "headers",
    verdict: OptionParityVerdict.ChangedDefault,
  },
  {
    note: "Ours adds `default-src 'self'` and `base-uri 'none'` and keeps the reviewed set in `defaults-review.md`, from OWASP, CSP Level 3 and the Fetch standard",
    ours: "headers.contentSecurityPolicy",
    upstream: "headers.contentSecurityPolicy",
    verdict: OptionParityVerdict.ChangedDefault,
  },
  {
    note: "Same default: `credentialless` in production and `unsafe-none` in development, as `defaults-review.md` records",
    ours: "headers.crossOriginEmbedderPolicy",
    upstream: "headers.crossOriginEmbedderPolicy",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: `same-origin`",
    ours: "headers.crossOriginOpenerPolicy",
    upstream: "headers.crossOriginOpenerPolicy",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: `same-origin`, from the Fetch standard",
    ours: "headers.crossOriginResourcePolicy",
    upstream: "headers.crossOriginResourcePolicy",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: `?1`, from MDN's `Origin-Agent-Cluster`",
    ours: "headers.originAgentCluster",
    upstream: "headers.originAgentCluster",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Ours denies the features OWASP's `ci/headers_add.json` denies by default, where upstream denies five. The list is in `defaults-review.md`",
    ours: "headers.permissionsPolicy",
    upstream: "headers.permissionsPolicy",
    verdict: OptionParityVerdict.ChangedDefault,
  },
  {
    note: "Same default: `no-referrer`, from OWASP",
    ours: "headers.referrerPolicy",
    upstream: "headers.referrerPolicy",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Ours is two years, `max-age=63072000`, where upstream is 180 days. The two-year value is OWASP's, and RFC 6797 defines the header",
    ours: "headers.strictTransportSecurity",
    upstream: "headers.strictTransportSecurity",
    verdict: OptionParityVerdict.ChangedDefault,
  },
  {
    note: "Same default: `nosniff`, from OWASP",
    ours: "headers.xContentTypeOptions",
    upstream: "headers.xContentTypeOptions",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: `off`, from OWASP",
    ours: "headers.xDNSPrefetchControl",
    upstream: "headers.xDNSPrefetchControl",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: `noopen`",
    ours: "headers.xDownloadOptions",
    upstream: "headers.xDownloadOptions",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: `SAMEORIGIN`",
    ours: "headers.xFrameOptions",
    upstream: "headers.xFrameOptions",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Same default: `none`, from OWASP",
    ours: "headers.xPermittedCrossDomainPolicies",
    upstream: "headers.xPermittedCrossDomainPolicies",
    verdict: OptionParityVerdict.Ported,
  },
  {
    note: "Legacy. MDN's `X-XSS-Protection` page records the header as non-standard and deprecated, and browsers have removed the auditor it configured, so its value does nothing. Our serializer test pins it not sent",
    upstream: "headers.xXSSProtection",
    verdict: OptionParityVerdict.Dropped,
  },
  { note: "Same default: on", ours: "hidePoweredBy", upstream: "hidePoweredBy", verdict: OptionParityVerdict.Ported },
  { note: "Same default: on", ours: "nonce", upstream: "nonce", verdict: OptionParityVerdict.Ported },
  {
    note: "Upstream is on at 150 tokens per five minutes, keyed on a forwarded address the client can write (upstream audit #83 and #196). Ours is off by default, and a rebuilt limiter is ours to add",
    ours: "rateLimiter",
    upstream: "rateLimiter",
    verdict: OptionParityVerdict.ChangedDefault,
  },
  {
    note: "Upstream drops console calls by default. Ours is off, since what an app logs is its own choice and no OWASP, MDN or W3C source asks for them to be dropped",
    ours: "removeLoggers",
    upstream: "removeLoggers",
    verdict: OptionParityVerdict.ChangedDefault,
  },
  {
    note: "Same defaults: 2 MB for a request and 8 MB for a file upload, declared in `getDefaultModuleOptions`. The app sets its own from `MAX_REQUEST_SIZE` and `MAX_FILE_REQUEST_SIZE`",
    ours: "requestSizeLimiter",
    upstream: "requestSizeLimiter",
    verdict: OptionParityVerdict.Ported,
  },
  { note: "Same default: on", ours: "sri", upstream: "sri", verdict: OptionParityVerdict.Ported },
  {
    note: "Same defaults: the meta and script hashes on, the style hashes off",
    ours: "ssg",
    upstream: "ssg",
    verdict: OptionParityVerdict.Ported,
  },
  { note: "Same default: off", ours: "strict", upstream: "strict", verdict: OptionParityVerdict.Ported },
  {
    note: "The module has no XSS validator. Its filter rejects ordinary text and passes a script once `escapeHtml` is off. OWASP's XSS Prevention Cheat Sheet calls for output encoding rather than input filtering, and rich text is sanitised at its Zod boundary, which owns it",
    upstream: "xssValidator",
    verdict: OptionParityVerdict.OutOfScope,
  },
];
