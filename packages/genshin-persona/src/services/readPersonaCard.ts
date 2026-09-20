import type { PersonaCard } from "#src/models/PersonaCard";

import { PERSONA_CARD_EXTENSION, PERSONA_CARDS_DIRECTORY } from "#src/services/constants";
import { getPersonaCardName } from "#src/services/getPersonaCardName";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// One card, loaded by the name its file is named for. Each card is its own module rather than a row of one table,
// So a session that needs one card pays for one — and the roster is the index, so nothing lists the cards twice
export const readPersonaCard = async (name: string): Promise<PersonaCard | undefined> => {
  const cardPath = join(PERSONA_CARDS_DIRECTORY, `${getPersonaCardName(name)}${PERSONA_CARD_EXTENSION}`);
  if (!existsSync(cardPath)) return undefined;

  const cardModule = (await import(pathToFileURL(cardPath).href)) as { default: PersonaCard };
  return cardModule.default;
};
