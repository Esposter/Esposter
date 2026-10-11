import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";
import type { SecurityState } from "#src/runtime/services/getSecurityState";

import { NONCE_PLACEHOLDER } from "#src/runtime/constants";

const SCRIPT_DIRECTIVES = new Set(["script-src", "script-src-elem"]);
const STYLE_DIRECTIVES = new Set(["style-src", "style-src-elem"]);

// The policy as one response sends it.
// The placeholder becomes the request's nonce in every directive that names it.
// A static nonce in the configuration is dropped, since a nonce in the policy is only ever the request's own.
// Without a nonce, the placeholder is dropped rather than sent as the literal text.
// The hashes the prerender collected are appended to the script and style directives they belong to.
export const updateContentSecurityPolicy = (
  policy: ContentSecurityPolicy,
  { hashes, nonce }: SecurityState,
): ContentSecurityPolicy =>
  Object.fromEntries(
    Object.keys(policy).map((directive) => {
      const value = policy[directive];
      if (!Array.isArray(value)) return [directive, value];

      const sources = value
        .filter((source: string) => !isStaticNonce(source))
        .map((source: string) => (source === NONCE_PLACEHOLDER && nonce ? `'nonce-${nonce}'` : source))
        .filter((source) => source !== NONCE_PLACEHOLDER);
      if (SCRIPT_DIRECTIVES.has(directive)) sources.push(...hashes.script);
      if (STYLE_DIRECTIVES.has(directive)) sources.push(...hashes.style);
      return [directive, sources];
    }),
  );

const isStaticNonce = (source: string): boolean => source.startsWith("'nonce-") && source !== NONCE_PLACEHOLDER;
