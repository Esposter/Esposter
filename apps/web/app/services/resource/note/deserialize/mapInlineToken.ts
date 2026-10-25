import type { TokensMapper } from "@/models/resource/note/deserialize/TokensMapper";
import type { JSONContent } from "@tiptap/core";
import type { Token } from "marked";

import { INLINE_MARK_TYPES } from "@/services/resource/note/deserialize/constants";
import { createTextNodes } from "@/services/resource/note/deserialize/createTextNodes";
import { getTokenText } from "@/services/resource/note/deserialize/getTokenText";
import { withMark } from "@/services/resource/note/deserialize/withMark";
import { checkIsAllowedUrl, DEFAULT_ALLOWED_SCHEMES } from "@esposter/shared";

export const mapInlineToken = (token: Token, mapInlineTokens: TokensMapper): JSONContent[] => {
  const markType = INLINE_MARK_TYPES[token.type];
  if (markType) return withMark(mapInlineTokens(token.tokens), { type: markType });

  // A link to a scheme that can run a script is kept as its text, the way the webpage's own links refuse it
  if (token.type === "link")
    return checkIsAllowedUrl(token.href, DEFAULT_ALLOWED_SCHEMES)
      ? withMark(mapInlineTokens(token.tokens), { attrs: { href: token.href }, type: "link" })
      : mapInlineTokens(token.tokens);

  if (token.type === "codespan") return createTextNodes(token.text, [{ type: "code" }]);

  if (token.type === "br") return [{ type: "hardBreak" }];

  // Escapes, plain text, an image's alt text and raw HTML keep their words. A node the kit has for HTML is not
  // reached: raw HTML is read as the text it carries, never as markup
  return "tokens" in token && token.tokens ? mapInlineTokens(token.tokens) : createTextNodes(getTokenText(token));
};
