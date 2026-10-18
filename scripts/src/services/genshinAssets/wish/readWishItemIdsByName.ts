import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { GameLanguage } from "genshin-text";
import { keepKitRecords } from "#src/services/genshinAssets/wish/keepKitRecords";
import { CharacterIdCreateKitBehaviourMap, characterDataSchema, GameDataset, weaponDataSchema } from "genshin-world";
import { z } from "zod";

// Whether a character id has a kit of its own, the record a playable character is read by
const hasKit = (id: number): boolean => Object.hasOwn(CharacterIdCreateKitBehaviourMap, id);

// Every character and weapon the stat tables hold, joined to its English name through the text id it cites in the
// English names the game publishes, each name's ids in the order the tables give them. An item with no English name
// Joins no name, so no banner can name it. A name joining several records keeps the one its kit names, the playable
// Character, since the duplicate copy of a character carries the same name
export const readWishItemIdsByName = async (): Promise<Map<string, number[]>> => {
  const englishNames = await readPublishedGameData<Record<string, string>>(
    `${GameDataset.NameText}/${GameLanguage.English}`,
  );
  const characters = z.array(characterDataSchema).parse(await readPublishedGameData("stats/characters"));
  const weapons = z.array(weaponDataSchema).parse(await readPublishedGameData("stats/weapons"));
  const idsByName = new Map<string, number[]>();
  for (const { id, nameTextId } of [...characters, ...weapons]) {
    const name = englishNames[nameTextId];
    if (name === undefined || name === "") continue;

    idsByName.set(name, [...(idsByName.get(name) ?? []), id]);
  }
  return new Map([...idsByName].map(([name, ids]) => [name, keepKitRecords(ids, hasKit)]));
};
