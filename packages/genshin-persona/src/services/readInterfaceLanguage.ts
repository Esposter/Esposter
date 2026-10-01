import type { GameLanguage } from "#src/generated/genshinText/models/GameLanguage";

import { checkIsGameLanguage } from "#src/generated/genshinText/services/checkIsGameLanguage";
import { DEFAULT_LANGUAGE, INTERFACE_LANGUAGE_PATH } from "#src/services/constants";
import { readStateFile } from "#src/services/readStateFile";

// The language every word the plugin writes is in. The game's fifteen are a list the plugin carries rather than
// One it asks the data package for, so the state file is checked against it exactly on the session-start path, where
// Nothing loads the package: anything else — which the roster cache would otherwise take into a file path — is not
// Read at all
export const readInterfaceLanguage = (): GameLanguage => {
  const language = readStateFile(INTERFACE_LANGUAGE_PATH);
  return checkIsGameLanguage(language) ? language : DEFAULT_LANGUAGE;
};
