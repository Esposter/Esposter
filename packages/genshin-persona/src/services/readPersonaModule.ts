import { MODULE_EXTENSION } from "#src/services/constants";
import { getPersonaCardName } from "#src/services/getPersonaCardName";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// One per-character module — a card, a voice — loaded by the name its file is named for. Each is its own module
// Rather than a row of one table, so a session that needs one pays for one, and the roster is the index, so nothing
// Lists them twice
export const readPersonaModule = async <T>(directory: string, name: string): Promise<T | undefined> => {
  const modulePath = join(directory, `${getPersonaCardName(name)}${MODULE_EXTENSION}`);
  if (!existsSync(modulePath)) return undefined;

  const personaModule = (await import(pathToFileURL(modulePath).href)) as { default: T };
  return personaModule.default;
};
