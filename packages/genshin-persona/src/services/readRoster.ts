import type { Character } from "#src/models/Character";

import { readGenshinDb } from "#src/services/readGenshinDb";
import { readGenshinDbVersion } from "#src/services/readGenshinDbVersion";
import { readRosterCache } from "#src/services/readRosterCache";
import { writeRosterCache } from "#src/services/writeRosterCache";

// Loading the game-data package costs the better part of a second, and the query it then answers costs two
// Milliseconds — so the roster is read once per installed version and kept beside the plugin's other state. The
// Version is the key, so a dependency bump invalidates the cache by itself: nothing is generated, nothing is
// Checked in, and no step is added to a bump
export const readRoster = (): Character[] => {
  const version = readGenshinDbVersion();
  const cachedRoster = readRosterCache(version);
  if (cachedRoster) return cachedRoster;

  const genshindb = readGenshinDb();
  const characters = genshindb.characters("names", { matchCategories: true, verboseCategories: true });
  const roster = characters.map<Character>(
    ({
      affiliation,
      birthdaymmdd,
      constellation,
      description,
      elementText,
      name,
      region,
      title,
      version: patch,
      weaponText,
    }) => ({
      affiliation,
      birthday: birthdaymmdd,
      constellation,
      description,
      element: elementText,
      name,
      region,
      title,
      version: patch,
      weapon: weaponText,
    }),
  );
  writeRosterCache(version, roster);
  return roster;
};
