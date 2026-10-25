import type { TokensMapper } from "#shared/models/resource/note/deserialize/TokensMapper";
import type { JSONContent } from "@tiptap/core";
import type { Token } from "marked";

import { INLINE_MARK_TYPES } from "#shared/services/resource/note/deserialize/constants";
import { createTextNodes } from "#shared/services/resource/note/deserialize/createTextNodes";
import { getTokenText } from "#shared/services/resource/note/deserialize/getTokenText";
import { withMark } from "#shared/services/resource/note/deserialize/withMark";
import { checkIsAllowedUrl, DEFAULT_ALLOWED_SCHEMES } from "@esposter/shared";

export const mapInlineToken = (token: Token, mapInlineTokens: TokensMapper): JSONContent[] => {
  // Only some inline tokens hold other tokens, so the ones a token holds are read where it may hold any
  const tokens = "tokens" in token ? token.tokens : undefined;
  const markType = INLINE_MARK_TYPES[token.type];
  if (markType) return withMark(mapInlineTokens(tokens), { type: markType });

  // A link to a scheme that can run a script is kept as its text, the way the webpage's own links refuse it
  if (token.type === "link")
    return checkIsAllowedUrl(token.href, DEFAULT_ALLOWED_SCHEMES)
      ? withMark(mapInlineTokens(tokens), { attrs: { href: token.href }, type: "link" })
      : mapInlineTokens(tokens);

  if (token.type === "codespan") return createTextNodes(token.text, [{ type: "code" }]);

  if (token.type === "br") return [{ type: "hardBreak" }];

  // Escapes, plain text, an image's alt text and raw HTML keep their words. A node the kit has for HTML is not
  // Reached: raw HTML is read as the text it carries, never as markup
  return tokens ? mapInlineTokens(tokens) : createTextNodes(getTokenText(token));
};
