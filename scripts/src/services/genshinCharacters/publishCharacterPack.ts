import type { CharacterPackFile } from "#src/models/genshinCharacters/CharacterPackFile";
import type { PublishCharacterPackOptions } from "#src/models/genshinCharacters/PublishCharacterPackOptions";

import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { createGameDataContainerClient } from "#src/services/gameData/createGameDataContainerClient";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { publishCharacterPackToTarget } from "#src/services/genshinCharacters/publishCharacterPackToTarget";
import { compressZstd } from "@esposter/db";
import { DEFAULT_COMPRESSION_LEVEL } from "@esposter/shared";
import { getCharacterPackKey } from "genshin-world";

// One pack's publish: its files are stored in each target account, and only once every account holds them is its record
// Published and its hash written into the lock, through the game data's own step, so the world never names a pack an
// Account lacks. A pack the lock already names is left as it is, and a dry run touches no account. Returns a note of
// What the publish did
export const publishCharacterPack = async ({
  isDryRun,
  pack,
  targets,
}: PublishCharacterPackOptions): Promise<string> => {
  const key = getCharacterPackKey(pack.characterId);
  if ((await readGameDataLock()).objects[key] === pack.packHash) return `${key}: unchanged, no request made`;
  const byteCount = pack.files.reduce((total, { body }) => total + body.byteLength, 0);
  if (isDryRun)
    return `${key}: dry run, ${pack.files.length} files of ${byteCount} bytes would be published as ${pack.packHash}`;
  const compressedBodyMap = new Map<string, Promise<Buffer>>();
  // Compressed once and shared by every account, which hold the same bytes
  const getBody = (file: CharacterPackFile): Promise<Buffer> => {
    if (!file.isCompressed) return Promise.resolve(file.body);
    const body = compressedBodyMap.get(file.path) ?? compressZstd(file.body, DEFAULT_COMPRESSION_LEVEL);
    compressedBodyMap.set(file.path, body);
    return body;
  };
  const uploadNotes = await Promise.all(
    targets.map(
      async (target) =>
        `${await publishCharacterPackToTarget(createGameDataContainerClient(target), pack, getBody)} files uploaded to ${target}`,
    ),
  );
  const uploadNote = uploadNotes.join(", ");
  if (!Object.values(GameDataTarget).every((target) => targets.includes(target)))
    return `${key}: ${uploadNote}, and the lock is untouched until both accounts hold the pack`;
  const lockNote = await publishGameDataStep({
    isDryRun: false,
    publication: { indexes: {}, objects: { [key]: pack.manifest } },
    scopes: [key],
  });
  return `${key}: ${uploadNote}; ${lockNote}`;
};
