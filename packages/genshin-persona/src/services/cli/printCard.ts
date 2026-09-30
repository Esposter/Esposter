import type { Character } from "#src/models/Character";
import type { GenshinContext } from "#src/models/GenshinContext";

import { formatCard } from "#src/services/formatCard";
import { getCard } from "#src/services/getCard";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readLocalization } from "#src/services/readLocalization";
import { readPersonaCard } from "#src/services/readPersonaCard";

// The language is read again rather than taken from the run's context, because the `language` verb changes it and then
// Prints the card: the card a verb prints is always in the language in force at the end of that verb
export const printCard = async ({ today }: GenshinContext, character: Character): Promise<void> => {
  const localization = await readLocalization(readInterfaceLanguage());
  const card = getCard(character, today, localization, await readPersonaCard(character.name));
  console.log(formatCard(card));
};
