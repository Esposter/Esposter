import { DEFAULT_LANGUAGE, INTERFACE_LANGUAGE_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// The language every word the plugin writes is in. Read on the session-start path, so it is the file and nothing
// Else: what is in it was checked against the data package when it was written
export const readInterfaceLanguage = (): string => {
  const language = existsSync(INTERFACE_LANGUAGE_PATH) ? readFileSync(INTERFACE_LANGUAGE_PATH, "utf8").trim() : "";
  return language || DEFAULT_LANGUAGE;
};
