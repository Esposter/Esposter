import type { Token } from "marked";

export const getTokenText = (token: Token) =>
  "text" in token && typeof token.text === "string" ? token.text : token.raw;
