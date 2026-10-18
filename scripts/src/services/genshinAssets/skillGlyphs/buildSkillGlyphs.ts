import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { SkillGlyphs } from "genshin-world";

import { SkillGlyphTonesMap } from "#src/services/genshinAssets/skillGlyphs/constants";
import { getSkillGlyphsLoaderMapSource } from "#src/services/genshinAssets/skillGlyphs/getSkillGlyphsLoaderMapSource";
import { traceTalentIcon } from "#src/services/genshinAssets/skillGlyphs/traceTalentIcon";
import { getCharacterSkillDepotRows } from "#src/services/genshinAssets/stats/getCharacterSkillDepotRows";
import { readPlayableAvatarRows } from "#src/services/genshinAssets/stats/readPlayableAvatarRows";
import { readSkillDepotMap } from "#src/services/genshinAssets/stats/readSkillDepotMap";
import { readSkillMap } from "#src/services/genshinAssets/stats/readSkillMap";
import { resolveWikiFiles } from "#src/services/genshinParity/shared/resolveWikiFiles";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";
import { GameDataset, skillGlyphsSchema } from "genshin-world";

// The wiki files a talent's name with its colons dropped, or, for a few, made dashes
const getTitles = (talentName: string) => [
  ...new Set(["", "-"].map((colon) => `File:Talent ${talentName.replaceAll(":", colon)}.png`)),
];

// Every playable character's skill and burst icons as the HUD's buttons carry them, each traced from the wiki's render
// Of its talent (`File:Talent <Name>.png`) by `traceTalentIcon`, one entry a character of the hosted `skillGlyphs` index,
// And the loader map's source naming the characters it holds, written only once published. A talent is named in English
// From the first of the character's skill Sets that names both (`getCharacterSkillDepotRows`), and the wiki files a
// Name's colons as nothing or as a dash, so both titles are asked for. A character the wiki holds either icon of under
// Neither is left out and noted
export const buildSkillGlyphs = async (): Promise<{
  loaderMapSource: string;
  notes: string[];
  publication: GameDataPublication;
}> => {
  const skillDepotMap = readSkillDepotMap();
  const skillMap = readSkillMap();
  const englishTextMap = readTextMap(GameLanguage.English);
  const getSkillName = (skillId = 0) => englishTextMap.get(String(skillMap.get(skillId)?.nameTextMapHash));
  const characterTalents = readPlayableAvatarRows().flatMap((avatarRow) => {
    for (const { energySkill, skills } of getCharacterSkillDepotRows(avatarRow, skillDepotMap, skillMap)) {
      const skill = getSkillName(skills[1]);
      const burst = getSkillName(energySkill);
      if (skill && burst)
        return [
          {
            characterId: avatarRow.id,
            name: englishTextMap.get(String(avatarRow.nameTextMapHash)),
            talentNameMap: { burst, skill },
          },
        ];
    }
    return [];
  });
  const pathMap = await resolveWikiFiles([
    ...new Set(
      characterTalents.flatMap(({ talentNameMap }) =>
        Object.values(talentNameMap).flatMap((talentName) => getTitles(talentName)),
      ),
    ),
  ]);
  const findPath = (talentName: string) =>
    getTitles(talentName)
      .map((title) => pathMap.get(title))
      .find(Boolean);
  const notes: string[] = [];
  const characterIdSkillGlyphsEntries: [number, SkillGlyphs][] = [];
  for (const { characterId, name, talentNameMap } of characterTalents) {
    const burstPath = findPath(talentNameMap.burst);
    const skillPath = findPath(talentNameMap.skill);
    if (!burstPath || !skillPath) {
      const missingNames = Object.values(talentNameMap).filter((talentName) => !findPath(talentName));
      notes.push(`${name} (${characterId}): ${missingNames.join(" and ")} not on the wiki`);
      continue;
    }
    characterIdSkillGlyphsEntries.push([
      characterId,
      skillGlyphsSchema.parse({
        // oxlint-disable-next-line no-await-in-loop -- Each trace holds a whole enlarged icon, so one is traced at a time
        burst: await traceTalentIcon(burstPath, SkillGlyphTonesMap.burst),
        // oxlint-disable-next-line no-await-in-loop -- Each trace holds a whole enlarged icon, so one is traced at a time
        skill: await traceTalentIcon(skillPath, SkillGlyphTonesMap.skill),
      }),
    ]);
  }
  notes.push(`${characterIdSkillGlyphsEntries.length} of ${characterTalents.length} characters' icons traced`);
  return {
    loaderMapSource: getSkillGlyphsLoaderMapSource(characterIdSkillGlyphsEntries.map(([characterId]) => characterId)),
    notes,
    publication: {
      indexes: {
        [GameDataset.SkillGlyphs]: Object.fromEntries(
          characterIdSkillGlyphsEntries.map(([characterId, skillGlyphs]) => [String(characterId), skillGlyphs]),
        ),
      },
      objects: {},
    },
  };
};
