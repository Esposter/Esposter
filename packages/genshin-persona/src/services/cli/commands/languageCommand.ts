import type { SubCommandsDef } from "citty";

import { GameLanguages } from "#src/generated/genshinText/models/GameLanguage";
import { getCanonicalLanguage } from "#src/generated/genshinText/services/getCanonicalLanguage";
import { getLanguageDisplayName } from "#src/generated/genshinText/services/getLanguageDisplayName";
import { GenshinVerb } from "#src/models/GenshinVerb";
import { getStatusReport } from "#src/services/cli/getStatusReport";
import { printCard } from "#src/services/cli/printCard";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { DEFAULT_LANGUAGE, VoiceLanguageNameMap } from "#src/services/constants";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { readLocalization } from "#src/services/readLocalization";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readPin } from "#src/services/readPin";
import { readRoster } from "#src/services/readRoster";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { recordSessionCharacter } from "#src/services/recordSessionCharacter";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { writeInterfaceLanguage } from "#src/services/writeInterfaceLanguage";
import { writePin } from "#src/services/writePin";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { defineCommand } from "citty";

export const languageCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Language },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { listFormat, sessionId, strings, today } = context;
    const name = args._.join(" ");
    // Each language is offered in its own words beside the word a person types for it, and either resolves
    const offered = listFormat.format(
      GameLanguages.map((languageName) => {
        const ownName = getLanguageDisplayName(languageName, languageName);
        return ownName === languageName ? languageName : `${languageName} (${ownName})`;
      }),
    );
    if (!name) {
      console.log(strings.status(await getStatusReport(context)));
      console.log(strings.languageMustBeOneOf(offered));
      return;
    }

    const canonicalLanguage = getCanonicalLanguage(name);
    if (!canonicalLanguage) {
      console.error(strings.languageMustBeOneOf(offered));
      process.exitCode = 1;
      return;
    }

    writeInterfaceLanguage(canonicalLanguage);
    // Everything downstream reads the language afresh: the roster in it, which builds that language's cache, the
    // Words that are ours in it, and the session's record and spinner, whose name is drawn from it
    const localizedRoster = readRoster(canonicalLanguage);
    const { strings: localizedStrings } = await readLocalization(canonicalLanguage);
    const pick = await resolveSessionCharacter(localizedRoster, sessionId, today);
    const character = pick?.character;
    if (character && sessionId) {
      recordSessionCharacter(character, sessionId, today.toString());
      await writeSessionSpinner(character, await readPersonaCard(character.name), canonicalLanguage);
    }

    const pin = readPin();
    const pinnedCharacter = findCharacterByName(localizedRoster, pin?.name ?? "");
    if (pinnedCharacter) writePin(pinnedCharacter);
    console.log(localizedStrings.interfaceLanguageSet(getLanguageDisplayName(canonicalLanguage, canonicalLanguage)));
    // A multi-gigabyte download is never a side effect of a labels setting, so the dub is reported on and left
    // Alone. Three states and three answers: no dub of this language, one that is not installed, and one that
    // Already is — which is the quiet case, since there is nothing for the person to do about it
    const [matchingDub] =
      Object.entries(VoiceLanguageNameMap).find(([, languageName]) => languageName === canonicalLanguage) ?? [];
    if (canonicalLanguage !== DEFAULT_LANGUAGE)
      if (!matchingDub) console.log(localizedStrings.voiceLanguageUnavailable);
      else if (matchingDub !== readVoiceLanguage()) console.log(localizedStrings.voiceLanguageAvailable(matchingDub));

    if (character) await printCard(context, character);
  },
});
