import type { JSONContent } from "@tiptap/core";
import type { Token } from "marked";

import { mapBlockToken } from "@/services/resource/note/deserialize/mapBlockToken";

export const mapBlockTokens = (tokens: Token[] = []): JSONContent[] =>
  tokens.flatMap((token) => mapBlockToken(token, mapBlockTokens));
