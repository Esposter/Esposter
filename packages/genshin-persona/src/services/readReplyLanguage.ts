import { REPLY_LANGUAGE_PATH } from "#src/services/constants";
import { readStateFile } from "#src/services/readStateFile";

// The language the model answers in, and nothing when it has never been set on its own — which is the cascade:
// A caller falls back to the interface language, so the absence is the fact rather than a copy of that value. It
// Takes any text the model could answer in, and unlike the interface language it reaches no file path, so it has no
// Shape to check
export const readReplyLanguage = (): string | undefined => readStateFile(REPLY_LANGUAGE_PATH) || undefined;
