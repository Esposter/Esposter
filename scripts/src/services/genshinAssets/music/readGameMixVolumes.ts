import type { SoundBankObject } from "#src/models/genshinAssets/music/SoundBankObject";
import type { WwiseNode } from "#src/models/genshinAssets/music/WwiseNode";

import { SoundBankObjectType } from "#src/models/genshinAssets/music/SoundBankObjectType";
import { computeWwiseVolume } from "#src/services/genshinAssets/music/computeWwiseVolume";
import { parseSoundBankObjects } from "#src/services/genshinAssets/music/parseSoundBankObjects";
import { parseSoundBankParameterDefaults } from "#src/services/genshinAssets/music/parseSoundBankParameterDefaults";
import { parseWwiseNode } from "#src/services/genshinAssets/music/parseWwiseNode";
import { readGameSoundBanks } from "#src/services/genshinAssets/music/readGameSoundBanks";
import { InvalidOperationError, Operation } from "@esposter/shared";

const MIX_OBJECT_TYPES: ReadonlySet<SoundBankObjectType> = new Set(
  Object.values(SoundBankObjectType).filter((value) => typeof value === "number"),
);
const PLAYING_OBJECT_TYPES: ReadonlySet<SoundBankObjectType> = new Set([
  SoundBankObjectType.MusicTrack,
  SoundBankObjectType.Sound,
]);
// How loud the game's mix plays each sound or music track `checkIsPlaying` picks, in decibels over its sources as
// Decoded, from every sound bank of the installed game: through the object, every parent and every bus above them, with
// Each game parameter at the default the initial bank gives it (`computeWwiseVolume`). A bank repeats the objects of
// Another, so an id's first copy is kept, its bytes copied out so the bank they came from is freed; of the objects
// That play, only those picked are kept, since nothing sends through them
export const readGameMixVolumes = async (
  checkIsPlaying: (id: number, node: WwiseNode) => boolean,
): Promise<{ id: number; sourceIds: number[]; volume: number }[]> => {
  const objectMap = new Map<number, SoundBankObject>();
  const playingIdNodeMap = new Map<number, WwiseNode>();
  let parameterDefaults: Map<number, number> | undefined;
  for await (const bank of readGameSoundBanks()) {
    parameterDefaults ??= parseSoundBankParameterDefaults(bank);
    for (const object of parseSoundBankObjects(bank, MIX_OBJECT_TYPES)) {
      if (objectMap.has(object.id)) continue;
      if (PLAYING_OBJECT_TYPES.has(object.type)) {
        const node = parseWwiseNode(object);
        if (!checkIsPlaying(object.id, node)) continue;
        playingIdNodeMap.set(object.id, node);
      }
      objectMap.set(object.id, { ...object, data: Buffer.from(object.data) });
    }
  }
  if (!parameterDefaults) throw new InvalidOperationError(Operation.Read, "sound banks", "hold no global settings");
  const defaults = parameterDefaults;
  return Array.from(playingIdNodeMap, ([id, { sourceIds }]) => ({
    id,
    sourceIds,
    volume: computeWwiseVolume(id, objectMap, defaults),
  }));
};
