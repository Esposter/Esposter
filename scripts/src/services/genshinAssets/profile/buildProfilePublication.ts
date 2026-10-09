import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { ExcelAvatarRow } from "#src/models/genshinAssets/profile/ExcelAvatarRow";
import type { ExcelFetterStoryRow } from "#src/models/genshinAssets/profile/ExcelFetterStoryRow";
import type { ExcelFetterVoiceRow } from "#src/models/genshinAssets/profile/ExcelFetterVoiceRow";
import type { ProfileText } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import {
  AVATAR_TABLE_NAME,
  FETTER_STORY_TABLE_NAME,
  FETTER_VOICE_TABLE_NAME,
} from "#src/services/genshinAssets/profile/constants";
import { getNamecardIconName } from "#src/services/genshinAssets/profile/getNamecardIconName";
import { selectFetterStoryRows } from "#src/services/genshinAssets/profile/selectFetterStoryRows";
import { toProfileStory } from "#src/services/genshinAssets/profile/toProfileStory";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage, GameLanguages } from "genshin-text";
import { characterDataSchema, GameDataset, profileTextSchema } from "genshin-world";
import { z } from "zod";

// Every playable character's profile, its stories by fetter and its namecard, one entry a character in each language's index
// Of the game data, every entry checked by the profile reader's schema before it is published. The characters are read from
// The game data their stats step published. Returns the publication and a note of the count
export const buildProfilePublication = async (): Promise<{ note: string; publication: GameDataPublication }> => {
  const characters = z.array(characterDataSchema).parse(await readPublishedGameData("stats/characters"));
  const characterIds = characters.map(({ id }) => id).toSorted((firstId, secondId) => firstId - secondId);
  const avatarRowMap = new Map(
    readExcelTable<ExcelAvatarRow>(AVATAR_TABLE_NAME).map((avatarRow) => [avatarRow.id, avatarRow]),
  );
  const storyRows = selectFetterStoryRows(
    readExcelTable<ExcelFetterStoryRow>(FETTER_STORY_TABLE_NAME),
    new Set(characterIds),
  );
  const storyRowsMap = Map.groupBy(storyRows, ({ avatarId }) => avatarId);
  // A voice-over is read as a story row, its title and line in the story's place, so both take the one conversion
  const voiceRows = selectFetterStoryRows(
    readExcelTable<ExcelFetterVoiceRow>(FETTER_VOICE_TABLE_NAME)
      .filter(({ isHiden }) => !isHiden)
      .map(({ avatarId, fetterId, openConds, voiceFileTextTextMapHash, voiceTitleTextMapHash }) => ({
        avatarId,
        fetterId,
        openConds,
        storyContextTextMapHash: voiceFileTextTextMapHash,
        storyTitleTextMapHash: voiceTitleTextMapHash,
      })),
    new Set(characterIds),
  );
  const voiceRowsMap = Map.groupBy(voiceRows, ({ avatarId }) => avatarId);
  const namecardIconNameMap = new Map(
    characterIds.map((avatarId) => [
      avatarId,
      getNamecardIconName(avatarId, avatarRowMap.get(avatarId)?.iconName ?? ""),
    ]),
  );
  const englishTextMap = readTextMap(GameLanguage.English);
  // Every language is read before anything is published, so a text map that fails to read publishes nothing
  const indexes = Object.fromEntries(
    GameLanguages.map((language) => {
      const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
      if (textMap.size === 0)
        throw new InvalidOperationError(Operation.Read, language, "has no text map in the dump: download it first");

      const profileTextMap = new Map(
        characterIds.map((avatarId): [number, ProfileText] => [
          avatarId,
          {
            namecardIconName: namecardIconNameMap.get(avatarId) ?? "",
            stories: (storyRowsMap.get(avatarId) ?? []).map((storyRow) =>
              toProfileStory(storyRow, textMap, englishTextMap),
            ),
            voices: (voiceRowsMap.get(avatarId) ?? []).map((voiceRow) =>
              toProfileStory(voiceRow, textMap, englishTextMap),
            ),
          },
        ]),
      );
      return [
        `${GameDataset.Profile}/${language}`,
        Object.fromEntries(
          characterIds.map((avatarId) => [String(avatarId), profileTextSchema.parse(profileTextMap.get(avatarId))]),
        ),
      ];
    }),
  );
  const namecardCount = [...namecardIconNameMap.values()].filter((namecardIconName) => namecardIconName !== "").length;
  return {
    note: `${characterIds.length} profiles, ${storyRows.length} stories, ${voiceRows.length} voice-overs and ${namecardCount} namecards built in ${GameLanguages.length} languages`,
    publication: { indexes, objects: {} },
  };
};
