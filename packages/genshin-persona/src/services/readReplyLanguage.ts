import { REPLY_LANGUAGE_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// The language the model answers in, and nothing when it has never been set on its own — which is the cascade:
// A caller falls back to the interface language, so the absence is the fact rather than a copy of that value
export const readReplyLanguage = (): string | undefined => {
  const language = existsSync(REPLY_LANGUAGE_PATH) ? readFileSync(REPLY_LANGUAGE_PATH, "utf8").trim() : "";
  return language || undefined;
};
