import type { OptionParity } from "#src/models/OptionParity";

// Every upstream option with one verdict. A ported row names our option, and a changed default's note names the source
// its default cites, as `defaults-review.md` does. `headers` itself is ported with changed defaults, and each of its
// keys carries its own row
export const OPTION_PARITY: OptionParity[] = [
  {
    upstream: "allowedMethodsRestricter",
    verdict: "changedDefault",
    ours: "allowedMethodsRestricter",
    note: "Upstream's default is `methods: '*'`, which refuses no method, so a default-on handler only adds per-request work. Ours is off, and the cost is measured on the module page",
  },
  { upstream: "basicAuth", verdict: "ported", ours: "basicAuth", note: "Same default: off" },
  {
    upstream: "contentSecurityPolicyReportOnly",
    verdict: "ported",
    ours: "contentSecurityPolicyReportOnly",
    note: "Same default: off",
  },
  {
    upstream: "corsHandler",
    verdict: "ported",
    ours: "corsHandler",
    note: "Same default: the development server's origin, the same methods and a `204` preflight",
  },
  {
    upstream: "csrf",
    verdict: "ported",
    ours: "csrf",
    note: "Same default: off. Ours is the double submit cookie of the OWASP CSRF Prevention Cheat Sheet, not upstream's `nuxt-csurf` module",
  },
  { upstream: "enabled", verdict: "ported", ours: "enabled", note: "Same default: on" },
  {
    upstream: "headers",
    verdict: "changedDefault",
    ours: "headers",
    note: "Its keys carry the changed defaults: see `headers.contentSecurityPolicy`, `headers.permissionsPolicy` and `headers.strictTransportSecurity`",
  },
  {
    upstream: "headers.contentSecurityPolicy",
    verdict: "changedDefault",
    ours: "headers.contentSecurityPolicy",
    note: "Ours adds `default-src 'self'` and `base-uri 'none'` and keeps the reviewed set in `defaults-review.md`, from OWASP, CSP Level 3 and the Fetch standard",
  },
  {
    upstream: "headers.crossOriginEmbedderPolicy",
    verdict: "ported",
    ours: "headers.crossOriginEmbedderPolicy",
    note: "Same default: `credentialless` in production and `unsafe-none` in development, as `defaults-review.md` records",
  },
  {
    upstream: "headers.crossOriginOpenerPolicy",
    verdict: "ported",
    ours: "headers.crossOriginOpenerPolicy",
    note: "Same default: `same-origin`",
  },
  {
    upstream: "headers.crossOriginResourcePolicy",
    verdict: "ported",
    ours: "headers.crossOriginResourcePolicy",
    note: "Same default: `same-origin`, from the Fetch standard",
  },
  {
    upstream: "headers.originAgentCluster",
    verdict: "ported",
    ours: "headers.originAgentCluster",
    note: "Same default: `?1`, from MDN's `Origin-Agent-Cluster`",
  },
  {
    upstream: "headers.permissionsPolicy",
    verdict: "changedDefault",
    ours: "headers.permissionsPolicy",
    note: "Ours denies the features OWASP's `ci/headers_add.json` denies by default, where upstream denies five. The list is in `defaults-review.md`",
  },
  {
    upstream: "headers.referrerPolicy",
    verdict: "ported",
    ours: "headers.referrerPolicy",
    note: "Same default: `no-referrer`, from OWASP",
  },
  {
    upstream: "headers.strictTransportSecurity",
    verdict: "changedDefault",
    ours: "headers.strictTransportSecurity",
    note: "Ours is two years, `max-age=63072000`, where upstream is 180 days. The two-year value is OWASP's, and RFC 6797 defines the header",
  },
  {
    upstream: "headers.xContentTypeOptions",
    verdict: "ported",
    ours: "headers.xContentTypeOptions",
    note: "Same default: `nosniff`, from OWASP",
  },
  {
    upstream: "headers.xDNSPrefetchControl",
    verdict: "ported",
    ours: "headers.xDNSPrefetchControl",
    note: "Same default: `off`, from OWASP",
  },
  {
    upstream: "headers.xDownloadOptions",
    verdict: "ported",
    ours: "headers.xDownloadOptions",
    note: "Same default: `noopen`",
  },
  {
    upstream: "headers.xFrameOptions",
    verdict: "ported",
    ours: "headers.xFrameOptions",
    note: "Same default: `SAMEORIGIN`",
  },
  {
    upstream: "headers.xPermittedCrossDomainPolicies",
    verdict: "ported",
    ours: "headers.xPermittedCrossDomainPolicies",
    note: "Same default: `none`, from OWASP",
  },
  {
    upstream: "headers.xXSSProtection",
    verdict: "dropped",
    note: "Legacy. MDN's `X-XSS-Protection` page records the header as non-standard and deprecated, and browsers have removed the auditor it configured, so its value does nothing. Our serializer test pins it not sent",
  },
  { upstream: "hidePoweredBy", verdict: "ported", ours: "hidePoweredBy", note: "Same default: on" },
  { upstream: "nonce", verdict: "ported", ours: "nonce", note: "Same default: on" },
  {
    upstream: "rateLimiter",
    verdict: "changedDefault",
    ours: "rateLimiter",
    note: "Upstream is on at 150 tokens per five minutes, keyed on a forwarded address the client can write (upstream audit #83 and #196). Ours is off by default, and a rebuilt limiter is ours to add",
  },
  {
    upstream: "removeLoggers",
    verdict: "changedDefault",
    ours: "removeLoggers",
    note: "Upstream drops console calls by default. Ours is off, since what an app logs is its own choice and no OWASP, MDN or W3C source asks for them to be dropped",
  },
  {
    upstream: "requestSizeLimiter",
    verdict: "ported",
    ours: "requestSizeLimiter",
    note: "Same defaults: 2 MB for a request and 8 MB for a file upload",
  },
  { upstream: "sri", verdict: "ported", ours: "sri", note: "Same default: on" },
  {
    upstream: "ssg",
    verdict: "ported",
    ours: "ssg",
    note: "Same defaults: the meta, script hashes and Nitro headers on, the style hashes off",
  },
  { upstream: "strict", verdict: "ported", ours: "strict", note: "Same default: off" },
  {
    upstream: "xssValidator",
    verdict: "outOfScope",
    note: "The module has no XSS validator. Its filter rejects ordinary text and passes a script once `escapeHtml` is off, as the app's `security.test.ts` measures. OWASP's XSS Prevention Cheat Sheet calls for output encoding rather than input filtering, and rich text is sanitised at its Zod boundary, which owns it",
  },
];
