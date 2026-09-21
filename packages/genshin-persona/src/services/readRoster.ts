import type { Character } from "#src/models/Character";

import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readGenshinDbVersion } from "#src/services/readGenshinDbVersion";
import { readLanguageNames } from "#src/services/readLanguageNames";
import { readRosterCache } from "#src/services/readRosterCache";
import { writeRosterCache } from "#src/services/writeRosterCache";

// The roster is read once per installed version and interface language and kept beside the plugin's other state,
// Since loading the game-data package is the cost `readGenshinDb` names. Both are in the cache's name, so a
// Dependency bump and a change of language each invalidate it by themselves: nothing is generated, nothing is
// Checked in, and no step is added to a bump.
//
// Two queries rather than one: the English records are the identity every state file and every lookup is keyed by,
// And the localized records are what is read. The second asks by the English names, so a character is the same
// Character in both, and they are matched on the id the package gives rather than on the order it returns them in.
// The options are written out at each call rather than shared, because the overload that answers with a list is
// Chosen on the literal
export const readRoster = (language: string): Character[] => {
  const version = readGenshinDbVersion();
  const cachedRoster = readRosterCache(version, language);
  if (cachedRoster) return cachedRoster;

  const genshindb = readGenshinDb();
  const characters = genshindb.characters("names", { matchCategories: true, verboseCategories: true });
  // A language the package does not answer in leaves the English records standing in for their own display, which
  // Is what a hand-edited state file gets rather than an empty roster
  const resultLanguage = getCanonicalLanguage(readLanguageNames(), language);
  const localizedCharacters =
    resultLanguage && language !== DEFAULT_LANGUAGE
      ? genshindb.characters("names", {
          matchCategories: true,
          queryLanguages: [genshindb.Language.English],
          resultLanguage,
          verboseCategories: true,
        })
      : characters;
  const roster = characters.map<Character>((character) => {
    const localized = localizedCharacters.find(({ id }) => id === character.id) ?? character;
    return {
      affiliation: localized.affiliation,
      birthday: character.birthdaymmdd,
      constellation: localized.constellation,
      description: localized.description,
      displayElement: localized.elementText,
      displayName: localized.name,
      element: character.elementText,
      name: character.name,
      region: localized.region,
      title: localized.title,
      version: character.version,
      weapon: localized.weaponText,
    };
  });
  writeRosterCache(version, language, roster);
  return roster;
};
