import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";

import { toGcsimFolderName } from "#src/services/genshinAssets/kits/gcsim/toGcsimFolderName";

// The gcsim folder of a character by its English name: the folder its name runs together to, or the one whose config
// Names it so among its shortcuts, `Kujou Sara` the folder `sara`. None where gcsim has no folder for the character
export const findGcsimFolder = (
  characterMap: ReadonlyMap<string, GcsimCharacter>,
  name: string,
): string | undefined => {
  const key = toGcsimFolderName(name);
  if (characterMap.has(key)) return key;
  for (const [folder, { config }] of characterMap) if (config.names.includes(key)) return folder;
  return undefined;
};
