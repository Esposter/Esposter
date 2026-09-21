import { checkIsLanguageName } from "#src/services/checkIsLanguageName";
import { DEFAULT_LANGUAGE, INTERFACE_LANGUAGE_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// The language every word the plugin writes is in. Read on the session-start path, so what is in the file is
// Checked for shape rather than against the data package, which no hook path loads: a name the package does not
// Answer in falls back where it is used, and anything that is not a name at all — which the roster cache would
// Otherwise take into a file path — is not read at all
export const readInterfaceLanguage = (): string => {
  const language = existsSync(INTERFACE_LANGUAGE_PATH) ? readFileSync(INTERFACE_LANGUAGE_PATH, "utf8").trim() : "";
  return checkIsLanguageName(language) ? language : DEFAULT_LANGUAGE;
};
