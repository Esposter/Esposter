import type { ExcelAvatarRow } from "#src/models/genshinAssets/profile/ExcelAvatarRow";
import type { ExcelFetterStoryRow } from "#src/models/genshinAssets/profile/ExcelFetterStoryRow";
import type { CharacterData, ProfileText } from "genshin-world";

import {
  AVATAR_TABLE_NAME,
  FETTER_STORY_TABLE_NAME,
  PROFILE_GENERATED_DIRECTORY,
  PROFILE_TEXT_LOADER_MAP_PATH,
} from "#src/services/genshinAssets/profile/constants";
import { getNamecardIconName } from "#src/services/genshinAssets/profile/getNamecardIconName";
import { selectFetterStoryRows } from "#src/services/genshinAssets/profile/selectFetterStoryRows";
import { toProfileStory } from "#src/services/genshinAssets/profile/toProfileStory";
import { STATS_GENERATED_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage, GameLanguages } from "genshin-text";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Every playable character's profile, its stories by fetter and its namecard, written as two levels like the book bodies:
// One chunk a character and a language, and one module a character holding its languages' loaders, both beside a loader
// Map that imports each character's module on demand, so a reader downloads its character's module and then one language.
// Returns a note of the count
export const writeProfileText = (): string[] => {
  const characters = parseMachineJson<CharacterData[]>(
    readFileSync(join(STATS_GENERATED_DIRECTORY, "characters.json"), "utf8"),
  );
  const characterIds = characters.map(({ id }) => id).toSorted((firstId, secondId) => firstId - secondId);
  const avatarRowMap = new Map(
    readExcelTable<ExcelAvatarRow>(AVATAR_TABLE_NAME).map((avatarRow) => [avatarRow.id, avatarRow]),
  );
  const storyRows = selectFetterStoryRows(
    readExcelTable<ExcelFetterStoryRow>(FETTER_STORY_TABLE_NAME),
    new Set(characterIds),
  );
  const storyRowsMap = Map.groupBy(storyRows, ({ avatarId }) => avatarId);
  const namecardIconNameMap = new Map(
    characterIds.map((avatarId) => [
      avatarId,
      getNamecardIconName(avatarId, avatarRowMap.get(avatarId)?.iconName ?? ""),
    ]),
  );
  const englishTextMap = readTextMap(GameLanguage.English);
  // Every language is read before the last run's files are removed, so a text map that fails to read leaves them
  const languageProfileTextMaps = GameLanguages.map((language) => {
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
        },
      ]),
    );
    return [language, profileTextMap] as const;
  });
  rmSync(PROFILE_GENERATED_DIRECTORY, { force: true, recursive: true });
  const loaderLines = characterIds.map((avatarId) => {
    const characterDirectory = join(PROFILE_GENERATED_DIRECTORY, String(avatarId));
    mkdirSync(characterDirectory, { recursive: true });
    const languageLines = languageProfileTextMaps.map(([language, profileTextMap]) => {
      writeFileSync(join(characterDirectory, `${language}.json`), JSON.stringify(profileTextMap.get(avatarId)));
      return `  ${language}: async () => (await import("#src/generated/profile/${avatarId}/${language}.json")).default,`;
    });
    writeFileSync(
      join(characterDirectory, "index.chunk.ts"),
      `import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// Written by \`pnpm -C scripts genshin:assets profile\`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
${languageLines.join("\n")}
} satisfies Readonly<Record<GameLanguage, () => Promise<ProfileText>>>;
`,
    );
    return `  [${avatarId}, async () => (await import("#src/generated/profile/${avatarId}/index.chunk")).default],`;
  });
  writeFileSync(
    PROFILE_TEXT_LOADER_MAP_PATH,
    `import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// The loader of each playable character's profile by its id, as \`genshin:assets profile\` writes them. A character's module
// Holds its loader of each language's chunk, and is imported on demand
export const ProfileTextLoaderMap: ReadonlyMap<
  number,
  () => Promise<Readonly<Record<GameLanguage, () => Promise<ProfileText>>>>
> = new Map([
${loaderLines.join("\n")}
]);
`,
  );
  const namecardCount = [...namecardIconNameMap.values()].filter((namecardIconName) => namecardIconName !== "").length;
  return [
    `${characterIds.length} profiles, ${storyRows.length} stories and ${namecardCount} namecards written in ${GameLanguages.length} languages`,
  ];
};
