import type { ExcelFetterStoryRow } from "#src/models/genshinAssets/profile/ExcelFetterStoryRow";
import type { ProfileStory } from "genshin-world";

import { FETTER_LEVEL_CONDITION_TYPE, FETTER_NONE_CONDITION_TYPE } from "#src/services/genshinAssets/profile/constants";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";

// A story as the Profile tab shows it in one language: its title and text by their text ids, read from the language's text
// Map and from English's where it lacks one, and the Friendship Level it opens at, 0 when no level does. A condition other
// Than a level or none keeps it locked whatever the level
export const toProfileStory = (
  row: ExcelFetterStoryRow,
  textMap: ReadonlyMap<string, string>,
  englishTextMap: ReadonlyMap<string, string>,
): ProfileStory => {
  const getText = (textId: number): string =>
    getPlainGameText(textMap.get(String(textId)) || (englishTextMap.get(String(textId)) ?? ""));
  const levelCondition = row.openConds.find(({ condType }) => condType === FETTER_LEVEL_CONDITION_TYPE);
  return {
    friendshipLevel: levelCondition?.paramList[0] ?? 0,
    hasOtherCondition: row.openConds.some(
      ({ condType }) => condType !== FETTER_NONE_CONDITION_TYPE && condType !== FETTER_LEVEL_CONDITION_TYPE,
    ),
    text: getText(row.storyContextTextMapHash),
    title: getText(row.storyTitleTextMapHash),
  };
};
