import type { JSONContent } from "@tiptap/core";
import type { Token } from "marked";

import { mapInlineToken } from "@/services/resource/note/deserialize/mapInlineToken";

export const mapInlineTokens = (tokens: Token[] = []): JSONContent[] =>
  tokens.flatMap((token) => mapInlineToken(token, mapInlineTokens));
