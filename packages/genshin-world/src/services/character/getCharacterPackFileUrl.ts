import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";

// Where a file of a character's pack is served: under the character's id and its pack's hash, by its path in the pack,
// Each part encoded on its own since a model's paths hold letters of any script
export const getCharacterPackFileUrl = (
  characterPackBaseUrl: string,
  characterId: number,
  packHash: string,
  path: string,
): string => {
  const encodedPath = getCharacterPackFilePath(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${characterPackBaseUrl}/${characterId}/${packHash}/${encodedPath}`;
};
