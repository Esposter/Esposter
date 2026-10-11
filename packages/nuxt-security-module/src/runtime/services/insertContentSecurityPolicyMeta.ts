import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";

import { serializeContentSecurityPolicy } from "#src/runtime/services/serializeContentSecurityPolicy";

const META_CONTENT_SECURITY_POLICY_REGEX = /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/iu;
const HEAD_CHARSET_REGEX = /<meta\s+charset=["'][^"']*["'][^>]*>/iu;
const HEAD_OPEN_REGEX = /<head\b[^>]*>/iu;

// The policy as a `<meta>` element, for a prerendered page that cannot carry the header.
// `frame-ancestors` is left out, since a browser ignores it in a meta element and reports the directive as an error.
// The element goes after the charset declaration, which the HTML standard requires to be the first thing in the head
export const insertContentSecurityPolicyMeta = (html: string, policy: ContentSecurityPolicy): string => {
  const metaTag = `<meta http-equiv="Content-Security-Policy" content="${serializeContentSecurityPolicy({ ...policy, "frame-ancestors": false })}">`;

  if (META_CONTENT_SECURITY_POLICY_REGEX.test(html)) return html.replace(META_CONTENT_SECURITY_POLICY_REGEX, metaTag);

  // A head that is only its elements, as a render hook holds it, has no start tag, so the element goes at its start
  const insertion = HEAD_CHARSET_REGEX.exec(html) ?? HEAD_OPEN_REGEX.exec(html);
  const insertAt = insertion ? insertion.index + insertion[0].length : 0;
  return html.slice(0, insertAt) + metaTag + html.slice(insertAt);
};
