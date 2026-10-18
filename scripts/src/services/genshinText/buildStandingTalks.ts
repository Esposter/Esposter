import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { Resident, Talk } from "genshin-world";

import { readHomeFavourRows } from "#src/services/genshinAssets/home/readHomeFavourRows";
import { REGION_DATA_DIRECTORY } from "#src/services/genshinAssets/residents/constants";
import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { getTalkTextIds } from "#src/services/genshinText/getTalkTextIds";
import { mapNpcStandingTalkIds } from "#src/services/genshinText/mapNpcStandingTalkIds";
import { readTalk } from "#src/services/genshinText/readTalk";
import { readTalkTables } from "#src/services/genshinText/readTalkTables";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { skipWordlessTalkLines } from "#src/services/genshinText/skipWordlessTalkLines";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguage } from "genshin-text";
import { GameDataset, talkSchema } from "genshin-world";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// The residents' standing talks, published with every word they show: each resident of a region's data whose talk is
// Their own standing talk has it read from the dialog and talk tables, its wordless lines skipped. A talk that cannot
// Be read so is left out and counted, and its resident holds no standing talk. The companions' favour talks are read the
// Same way, from the home event table, and published beside them with their words in the same chunks
export const buildStandingTalks = async (): Promise<GameDataBuild> => {
  const regionFileNames = await readdir(REGION_DATA_DIRECTORY);
  const regionResidents = await Promise.all(
    regionFileNames.map(
      async (fileName) =>
        parseMachineJson<{ residents?: Resident[] }>(await readFile(join(REGION_DATA_DIRECTORY, fileName), "utf8"))
          .residents ?? [],
    ),
  );
  const talkTables = await readTalkTables();
  const npcStandingTalkIdMap = mapNpcStandingTalkIds(talkTables.talkConfigMap.values());
  const standingTalkIds = new Set(
    regionResidents
      .flat()
      .filter(({ id, talkId }) => npcStandingTalkIdMap.get(Number(id)) === Number(talkId))
      .map(({ talkId }) => Number(talkId)),
  );
  const englishTextMap = readTextMap(GameLanguage.English);
  const readTalks = (talkIds: Iterable<number>): Talk[] =>
    [...talkIds].flatMap((talkId): Talk[] => {
      const talk = skipWordlessTalkLines(readTalk(talkId, talkTables), (textId) => Boolean(englishTextMap.get(textId)));
      return talk ? [talk] : [];
    });
  const talks = readTalks(standingTalkIds);
  const favourTalkIds = new Set(readHomeFavourRows().map(({ talkID }) => talkID));
  const favourTalks = readTalks(favourTalkIds);
  const textIds = new Set([...talks, ...favourTalks].flatMap((talk) => getTalkTextIds(talk)));
  textIds.delete("");
  const { notes, objects } = buildTextChunks(GameDataset.StandingTalkText, [...textIds].toSorted());
  return {
    notes: [
      ...notes,
      `${talks.length} of the residents' ${standingTalkIds.size} standing talks, and ${favourTalks.length} of the companions' ${favourTalkIds.size} favour talks, with ${textIds.size} of their words; ${standingTalkIds.size + favourTalkIds.size - talks.length - favourTalks.length} left out with a wordless reply, a wordless line that branches or no words at all`,
    ],
    objects: {
      ...objects,
      [`${GameDataset.StandingTalks}/favours`]: talkSchema.array().parse(favourTalks),
      [`${GameDataset.StandingTalks}/residents`]: talkSchema.array().parse(talks),
    },
  };
};
