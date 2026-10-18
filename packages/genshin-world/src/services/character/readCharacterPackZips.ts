import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { readCharacterPackZip } from "#src/services/character/readCharacterPackZip";
import { settleEach } from "#src/services/shared/settleEach";

// The zips a player picked, each read into its release. A zip that cannot be read is reported by its name and skipped, so one
// Corrupt archive never stops the rest of the pick from being read
export const readCharacterPackZips = async (
  files: readonly File[],
): Promise<{ failures: string[]; pickedCharacterPacks: PickedCharacterPack[] }> => {
  const { failures, results } = await settleEach(
    files,
    ({ name }) => name,
    async (file) => readCharacterPackZip(file.name, new Uint8Array(await file.arrayBuffer())),
  );
  return { failures, pickedCharacterPacks: results };
};
