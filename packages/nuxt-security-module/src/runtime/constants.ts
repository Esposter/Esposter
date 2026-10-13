import type { SecurityHeaders } from "#src/models/SecurityHeaders";

// The package's name, which prefixes every runtime hook the module calls and is the module's `meta.name`
export const MODULE_NAME = "nuxt-security-module";
// Called once, on the first request, before the module's route rules are matched, so a consumer can add or change a route's rules
export const ROUTE_RULES_HOOK: `${typeof MODULE_NAME}:routeRules` = `${MODULE_NAME}:routeRules`;
// The response header each option key is sent as
export const SECURITY_HEADER_NAMES: Readonly<Record<keyof SecurityHeaders, string>> = {
  contentSecurityPolicy: "Content-Security-Policy",
  crossOriginEmbedderPolicy: "Cross-Origin-Embedder-Policy",
  crossOriginOpenerPolicy: "Cross-Origin-Opener-Policy",
  crossOriginResourcePolicy: "Cross-Origin-Resource-Policy",
  originAgentCluster: "Origin-Agent-Cluster",
  permissionsPolicy: "Permissions-Policy",
  referrerPolicy: "Referrer-Policy",
  strictTransportSecurity: "Strict-Transport-Security",
  xContentTypeOptions: "X-Content-Type-Options",
  xDNSPrefetchControl: "X-DNS-Prefetch-Control",
  xDownloadOptions: "X-Download-Options",
  xFrameOptions: "X-Frame-Options",
  xPermittedCrossDomainPolicies: "X-Permitted-Cross-Domain-Policies",
};
// The header that holds a route's Content-Security-Policy when the policy is reported rather than enforced
export const CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER_NAME = "Content-Security-Policy-Report-Only";
// The most keys the in-memory rate limiter counts at once, and the key every request with no address is counted under
export const MAX_RATE_LIMIT_ENTRIES = 10_000;
export const UNKNOWN_CLIENT_KEY = "unknown";
// The methods that change state, which a CSRF check guards, and the random bytes behind a CSRF token
export const CSRF_UNSAFE_METHODS: readonly string[] = ["DELETE", "PATCH", "POST", "PUT"];
export const CSRF_TOKEN_BYTE_LENGTH = 32;
// The number of random bytes behind a nonce, which base64 encodes to a value no guess reproduces
export const NONCE_BYTE_LENGTH = 18;
// The placeholder a policy writes where the request's nonce goes
export const NONCE_PLACEHOLDER = "'nonce-{{nonce}}'";
// The hash algorithm a subresource's integrity attribute is computed with, and a script or style hash in a policy
export const SRI_HASH_ALGORITHM = "SHA-384";
export const CSP_HASH_ALGORITHM = "SHA-256";
// The directory beside the build where the prerendered headers are written, and the asset storage they are read from
export const PRERENDERED_HEADERS_DIRECTORY_NAME = "nuxt-security";
export const PRERENDERED_HEADERS_FILE_NAME = "headers.json";
// One attribute of a start tag: a name with an optional value, the value quoted or bare.
// A quoted value is read whole, so markup inside it is never a token of its own
const HTML_ATTRIBUTE_PATTERN = String.raw`\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>=]+))?`;
// Every attribute of a start tag, read for its name and its value
// oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this regex would otherwise infer
export const HTML_ATTRIBUTE_REGEX: RegExp =
  /\s+(?<name>[^\s"'<>/=]+)(?<assignment>\s*=\s*(?<value>"[^"]*"|'[^']*'|[^\s"'<>=]+))?/gu;
// A `script` or `style` element with its body, or any other start tag, each with its attribute text.
// Matched whole, so the markup a quoted attribute holds is never a tag of its own
// oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this regex would otherwise infer
export const HTML_TAG_REGEX: RegExp = new RegExp(
  String.raw`<(script|style)\b((?:${HTML_ATTRIBUTE_PATTERN})*)(\s*\/?)>([\s\S]*?)<\/\1\s*>|<([a-z][\w:-]*)((?:${HTML_ATTRIBUTE_PATTERN})*)(\s*\/?)>`,
  "giu",
);
// The elements a nonce is written onto, each of which the policy's `script-src`, `style-src` or preload rules govern
export const NONCE_TAG_NAMES: readonly string[] = ["link", "script", "style"];
// The content type a file upload is sent with, which takes the larger request size limit
export const FILE_UPLOAD_CONTENT_TYPE = "multipart/form-data";
// The methods that carry a body the request size limit measures
export const SIZE_LIMITED_METHODS: readonly string[] = ["DELETE", "POST", "PUT"];
// The realm a basic auth challenge names when the configuration sets no message
export const DEFAULT_BASIC_AUTH_REALM = "Please enter username and password";
// The scheme an authorization header takes for name and password credentials
export const BASIC_AUTHORIZATION_SCHEME = "Basic";
