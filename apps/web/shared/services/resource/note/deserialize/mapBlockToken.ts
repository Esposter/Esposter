import type { TokensMapper } from "#shared/models/resource/note/deserialize/TokensMapper";
import type { JSONContent } from "@tiptap/core";
import type { Token, Tokens } from "marked";

import { createParagraph } from "#shared/services/resource/note/deserialize/createParagraph";
import { createTextNodes } from "#shared/services/resource/note/deserialize/createTextNodes";
import { getTokenText } from "#shared/services/resource/note/deserialize/getTokenText";
import { mapInlineTokens } from "#shared/services/resource/note/deserialize/mapInlineTokens";
import { mapList } from "#shared/services/resource/note/deserialize/mapList";

// marked's catch-all token is typed with a bare string type, so a list is narrowed to its own type by this guard
const checkIsListToken = (token: Token): token is Tokens.List => token.type === "list";

export const mapBlockToken = (token: Token, mapBlockTokens: TokensMapper): JSONContent[] => {
  // A task item's checkbox is read into the item's checked attribute, so the token itself holds no text
  if (token.type === "space" || token.type === "checkbox") return [];

  if (token.type === "heading")
    return [{ attrs: { level: token.depth }, content: mapInlineTokens(token.tokens), type: "heading" }];

  if (token.type === "paragraph" || token.type === "text")
    return [createParagraph(mapInlineTokens(token.tokens ?? [token]))];

  if (token.type === "code")
    return [
      {
        attrs: { language: token.lang || null },
        ...(token.text === "" ? {} : { content: [{ text: token.text, type: "text" }] }),
        type: "codeBlock",
      },
    ];

  if (token.type === "blockquote") return [{ content: mapBlockTokens(token.tokens), type: "blockquote" }];

  if (token.type === "hr") return [{ type: "horizontalRule" }];

  if (checkIsListToken(token)) return [mapList(token, mapBlockTokens)];

  // Raw HTML and a construct the kit has no node for (a table) keep their text, as a paragraph
  const text = getTokenText(token).trim();
  return text === "" ? [] : [createParagraph(createTextNodes(text))];
};
