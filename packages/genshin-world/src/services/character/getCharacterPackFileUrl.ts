import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";

// Where a file of a character's pack is served: under the character's id, by its path in the pack, each part encoded on
// Its own since a model's paths hold letters of any script
export const getCharacterPackFileUrl = (characterPackBaseUrl: string, characterId: number, path: string): string => {
  const encodedPath = getCharacterPackFilePath(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${characterPackBaseUrl}/${characterId}/${encodedPath}`;
};
