import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { readCharacterPackZip } from "#src/services/character/readCharacterPackZip";
import { getResultAsync } from "@esposter/shared";

// The zips a player picked, each read into its release. A zip that cannot be read is reported by its name and skipped, so one
// Corrupt archive never stops the rest of the pick from being read
export const readCharacterPackZips = async (
  files: readonly File[],
): Promise<{ failures: string[]; pickedCharacterPacks: PickedCharacterPack[] }> => {
  const results = await Promise.all(
    files.map((file) =>
      getResultAsync(async () => readCharacterPackZip(file.name, new Uint8Array(await file.arrayBuffer()))).match(
        (pickedCharacterPack) => ({ pickedCharacterPack }),
        (error) => {
          console.error(error);
          return { failure: `${file.name}: ${error.message}` };
        },
      ),
    ),
  );
  return {
    failures: results.flatMap((result) => ("failure" in result ? [result.failure] : [])),
    pickedCharacterPacks: results.flatMap((result) =>
      "pickedCharacterPack" in result ? [result.pickedCharacterPack] : [],
    ),
  };
};
