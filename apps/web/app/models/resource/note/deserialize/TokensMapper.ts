import type { JSONContent } from "@tiptap/core";
import type { Token } from "marked";

export type TokensMapper = (tokens?: Token[]) => JSONContent[];
