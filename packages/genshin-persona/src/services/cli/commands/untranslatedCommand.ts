import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { printQueue } from "#src/services/cli/printQueue";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { readLocalization } from "#src/services/readLocalization";
import { defineCommand } from "citty";

export const untranslatedCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Untranslated },
  run: async () => {
    const context = await readGenshinContext();
    const { language } = context;
    // The queue the language modules are filled from, the way `unverbed` is the queue the cards' verbs are: who has
    // No gerunds in this language, or a card whose greeting it has not written. English reads both off the cards,
    // So it is never behind
    if (language === DEFAULT_LANGUAGE) return;

    const { characters } = await readLocalization(language);
    await printQueue(context, ({ character: { name: characterName }, personaCard }) => {
      const localizedPersonaCard = characters[characterName];
      return !localizedPersonaCard?.verbs || (Boolean(personaCard) && !localizedPersonaCard.greeting);
    });
  },
});
