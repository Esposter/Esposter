import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readPublishedGameDataEntries } from "#src/services/gameData/readPublishedGameDataEntries";
import { toTalentTables } from "#src/services/genshinAssets/stats/toTalentTables";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage } from "genshin-text";
import { characterDataSchema, characterTalentKitSchema, GameDataset, talentMultiplierMapSchema } from "genshin-world";
import { z } from "zod";

// A parameter of a label's format, with the times it repeats where the format writes it, `{param4:F1P}*4` or
// `{param6:F2P} Max HP ×3`
const PARAMETER_REGEX = /\{param(?<number>\d+):[^}]*\}(?:[^{}+/|]*?[*×]\s*(?<count>\d+))?/gu;
// A label's text per input layout, read as the PC's: `#{LAYOUT_MOBILE#Tap}{LAYOUT_PC#Press}{LAYOUT_PS#Press} CD`
const LAYOUT_REGEX = /#?\{LAYOUT_MOBILE#[^}]*\}\{LAYOUT_PC#(?<pc>[^}]*)\}\{LAYOUT_PS#[^}]*\}/gu;

// The published tables of the given characters, read through the lock as another step published them: each one's
// Element, weapon and English name, its combat talents' groups and their multipliers. Each group's labels come from the
// Dump's proud skill rows rather than the published label ids: a newer dump can move a label's text to another id,
// And add a parameter, so an id published from the older rows names another label under the newer text.
// At the first level, `Low/High Plunge DMG` reading parameters 8 and 9
export const readKitTables = async (characterIds: readonly number[]): Promise<Map<number, KitTables>> => {
  const ids = characterIds.map(String);
  const [characterDatasValue, characterTalentKitsValue, talentMultiplierMapValues] = await Promise.all([
    readPublishedGameData<unknown>(`${GameDataset.Stats}/characters`),
    readPublishedGameData<unknown>(`${GameDataset.Stats}/characterTalentKits`),
    readPublishedGameDataEntries<unknown>(GameDataset.TalentMultipliers, ids),
  ]);
  const characterDatas = z.array(characterDataSchema).parse(characterDatasValue);
  const characterTalentKits = z.array(characterTalentKitSchema).parse(characterTalentKitsValue);
  const proudSkillRows = readExcelTable<ExcelProudSkillRow>("ProudSkillExcelConfigData");
  const textMap = readTextMap(GameLanguage.English);
  return new Map(
    characterIds.map((characterId): [number, KitTables] => {
      const characterData = characterDatas.find(({ id }) => id === characterId);
      const characterTalentKit = characterTalentKits.find((talentKit) => talentKit.characterId === characterId);
      const name = characterData === undefined ? undefined : textMap.get(characterData.nameTextId);
      if (characterData === undefined || characterTalentKit === undefined || name === undefined)
        throw new InvalidOperationError(Operation.Read, String(characterId), "has no character or talent kit table");
      const talentMultiplierMap = talentMultiplierMapSchema.parse(talentMultiplierMapValues.get(String(characterId)));
      const { labelMap: talentLabelMap } = toTalentTables(
        proudSkillRows,
        new Set(Object.values(characterTalentKit.talentGroupIds)),
      );
      const labelMap = new Map(
        Object.entries(talentLabelMap).map(([proudSkillGroupId, levels]) => [
          Number(proudSkillGroupId),
          (levels[0]?.paramDescTextIds ?? []).flatMap((textId) => {
            const [label, format] = (textMap.get(String(textId)) ?? "").split("|");
            if (label === undefined || label === "" || format === undefined) return [];
            return [
              {
                indexes: [...format.matchAll(PARAMETER_REGEX)].flatMap(({ groups }) =>
                  Array.from({ length: Number(groups?.count ?? 1) }, () => Number(groups?.number) - 1),
                ),
                label: label.replaceAll(LAYOUT_REGEX, (_match, pc: string) => pc),
              },
            ];
          }),
        ]),
      );
      return [
        characterId,
        {
          characterId,
          element: characterData.element,
          labelMap,
          name,
          talentGroupIdMap: characterTalentKit.talentGroupIds,
          talentMultiplierMap,
          weaponType: characterData.weaponType,
        },
      ];
    }),
  );
};
