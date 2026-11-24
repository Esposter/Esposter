import { MODULE_EXTENSION } from "#src/services/constants";
import { getPersonaCardName } from "#src/services/getPersonaCardName";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// One per-character module (a card, a voice) is loaded by the name its file is named for.
// Each is its own module rather than a row of one table, so a session that needs one pays for one.
// The roster is the index, so nothing lists them twice.
export const readPersonaModule = async <T>(directory: string, name: string): Promise<T | undefined> => {
  const modulePath = join(directory, `${getPersonaCardName(name)}${MODULE_EXTENSION}`);
  if (!existsSync(modulePath)) return undefined;

  // The path is computed per character at runtime, so it cannot be a static import.
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a dynamic import of a runtime path
  const personaModule: { default: T } = await import(pathToFileURL(modulePath).href);
  return personaModule.default;
};
