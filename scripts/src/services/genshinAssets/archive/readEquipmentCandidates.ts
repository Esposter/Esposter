import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/archive/ExcelEquipAffixRow";
import type { ExcelReliquaryCodexRow } from "#src/models/genshinAssets/archive/ExcelReliquaryCodexRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/archive/ExcelReliquarySetRow";
import type { ExcelWeaponCodexRow } from "#src/models/genshinAssets/archive/ExcelWeaponCodexRow";
import type { ExcelWeaponRow } from "#src/models/genshinAssets/stats/ExcelWeaponRow";

import {
  EQUIP_AFFIX_TABLE_NAME,
  RELIQUARY_CODEX_TABLE_NAME,
  RELIQUARY_SET_TABLE_NAME,
  WEAPON_CODEX_TABLE_NAME,
  WEAPON_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The weapons and the artifact sets the Equipment section lists, each in the codex's order. A weapon is named by its
// Weapon row, and a set by the equip affix its set row holds, which carries the set's name
export const readEquipmentCandidates = (): { artifactSets: ArchiveCandidate[]; weapons: ArchiveCandidate[] } => {
  const weaponNameTextMapHashMap = new Map(
    readExcelTable<ExcelWeaponRow>(WEAPON_TABLE_NAME).map(({ id, nameTextMapHash }) => [id, nameTextMapHash]),
  );
  const weapons = readExcelTable<ExcelWeaponCodexRow>(WEAPON_CODEX_TABLE_NAME)
    .filter(({ isDisuse }) => !isDisuse)
    .flatMap(({ sortOrder, weaponId }) => {
      const nameTextMapHash = weaponNameTextMapHashMap.get(weaponId);
      return nameTextMapHash === undefined ? [] : [{ id: weaponId, nameTextMapHash, sortOrder }];
    });
  const equipAffixNameTextMapHashMap = new Map(
    readExcelTable<ExcelEquipAffixRow>(EQUIP_AFFIX_TABLE_NAME).map(({ id, nameTextMapHash }) => [id, nameTextMapHash]),
  );
  const equipAffixIdMap = new Map(
    readExcelTable<ExcelReliquarySetRow>(RELIQUARY_SET_TABLE_NAME).map(({ equipAffixId, setId }) => [
      setId,
      equipAffixId,
    ]),
  );
  const artifactSets = [
    ...Map.groupBy(readExcelTable<ExcelReliquaryCodexRow>(RELIQUARY_CODEX_TABLE_NAME), ({ suitId }) => suitId),
  ].flatMap(([suitId, rows]) => {
    const equipAffixId = equipAffixIdMap.get(suitId);
    const nameTextMapHash = equipAffixId === undefined ? undefined : equipAffixNameTextMapHashMap.get(equipAffixId);
    return nameTextMapHash === undefined
      ? []
      : [{ id: suitId, nameTextMapHash, sortOrder: Math.min(...rows.map(({ sortOrder }) => sortOrder)) }];
  });

  return { artifactSets, weapons };
};
