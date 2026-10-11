import { NONCE_TAG_NAMES } from "#src/runtime/constants";
import { rewriteHtmlTags } from "#src/runtime/services/rewriteHtmlTags";
import { stripHtmlTagAttribute } from "#src/runtime/services/stripHtmlTagAttribute";

// Every script, style and link element carries the request's nonce.
// One that already names a nonce has it replaced rather than duplicated.
// Markup inside a quoted attribute is never rewritten.
// So text a page renders from its own data cannot be turned into an executable element by the nonce.
export const injectNonce = (html: string, nonce: string): string =>
  rewriteHtmlTags(html, (tagName, attributes) =>
    NONCE_TAG_NAMES.includes(tagName.toLowerCase())
      ? ` nonce="${nonce}"${stripHtmlTagAttribute(attributes, "nonce")}`
      : undefined,
  );
