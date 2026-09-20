import type { Character } from "#src/models/Character";

import { readGenshinDb } from "#src/services/readGenshinDb";

export const readRoster = (): Character[] => {
  const genshindb = readGenshinDb();
  const characters = genshindb.characters("names", { matchCategories: true, verboseCategories: true });
  return characters.map(({ birthdaymmdd, description, elementText, name, region, title, version }) => ({
    birthday: birthdaymmdd,
    description,
    element: elementText,
    name,
    region,
    title,
    version,
  }));
};
