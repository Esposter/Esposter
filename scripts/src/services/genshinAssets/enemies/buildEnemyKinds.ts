import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";
import type { ExcelMonsterDescribeRow } from "#src/models/genshinAssets/enemies/ExcelMonsterDescribeRow";
import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";
import type { ImaginariumStage } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { ANIMAL_CODEX_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { collectEnemyKindIds } from "#src/services/genshinAssets/enemies/collectEnemyKindIds";
import {
  BASE_ATTACK_PROPERTY,
  BASE_DEFENSE_PROPERTY,
  BASE_HEALTH_PROPERTY,
  DEFAULT_CODEX_SUBTYPE,
  DEFAULT_SECURITY_LEVEL,
  MONSTER_DESCRIBE_TABLE_NAME,
  MONSTER_TABLE_NAME,
  WEEKLY_BOSS_KIND_IDS,
} from "#src/services/genshinAssets/enemies/constants";
import { findMonsterCodexRow } from "#src/services/genshinAssets/enemies/findMonsterCodexRow";
import { getGrowCurve } from "#src/services/genshinAssets/enemies/getGrowCurve";
import { readMonsterCurveRows } from "#src/services/genshinAssets/enemies/readMonsterCurveRows";
import { readRegionCampsData } from "#src/services/genshinAssets/enemies/readRegionCampsData";
import { toLevelCurve } from "#src/services/genshinAssets/enemies/toLevelCurve";
import { MONDSTADT_BOUNTY_TARGET_NAMES } from "#src/services/genshinAssets/reputation/constants";
import { readMonsterNames } from "#src/services/genshinAssets/reputation/readMonsterNames";
import { toBountyTargetIds } from "#src/services/genshinAssets/reputation/toBountyTargetIds";
import { readAbyssDescribeIds } from "#src/services/genshinAssets/spiralAbyss/readAbyssDescribeIds";
import { readAbyssFloors } from "#src/services/genshinAssets/spiralAbyss/readAbyssFloors";
import { toAbyssEnemyKinds } from "#src/services/genshinAssets/spiralAbyss/toAbyssEnemyKinds";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The kinds every region's camps place and every Mondstadt bounty, weekly boss, Spiral Abyss chamber and Imaginarium
// Stage fights, each read from the game's monster table with its family from the archive and its name's text id, and
// Every level curve they name, as the records of the enemies dataset. A kind the tables lack is an Error. The
// Resistances are keyed by the world's Elements, spelt as the game's tables spell them, which the world's schema
// Checks. Returns the records the kinds and curves publish under
export const buildEnemyKinds = async (): Promise<Record<string, unknown>> => {
  const regionDatas = await readRegionCampsData();
  const monsterRows = readExcelTable<MonsterRow>(MONSTER_TABLE_NAME);
  const monsterDescribeRows = readExcelTable<ExcelMonsterDescribeRow>(MONSTER_DESCRIBE_TABLE_NAME);
  const monsterCurveRows = readMonsterCurveRows();
  const animalCodexRows = readExcelTable<AnimalCodexRow>(ANIMAL_CODEX_TABLE_NAME);
  const monsterNames = readMonsterNames();
  const bountyKindIds = Object.values(MONDSTADT_BOUNTY_TARGET_NAMES).flatMap((names) =>
    toBountyTargetIds(names, monsterNames),
  );
  const abyssEnemyKindIds = Object.values(
    toAbyssEnemyKinds(readAbyssDescribeIds(readAbyssFloors(), animalCodexRows), monsterRows),
  );
  // The monsters the published Imaginarium stages fight, which the stages record names by monster id
  const stageEnemyKindIds = (
    await readPublishedGameData<ImaginariumStage[]>(`${GameDataset.Imaginarium}/stages`)
  ).flatMap(({ enemies }) => enemies.map(({ monsterId }) => monsterId));
  const extraKindIds = [...bountyKindIds, ...WEEKLY_BOSS_KIND_IDS, ...abyssEnemyKindIds, ...stageEnemyKindIds];
  const enemyKinds = collectEnemyKindIds(regionDatas, extraKindIds).map((enemyKindId) => {
    const monsterRow = monsterRows.find(({ id }) => id === enemyKindId);
    if (!monsterRow) throw new InvalidOperationError(Operation.Read, String(enemyKindId), "has no monster row");
    const codexRow = findMonsterCodexRow(animalCodexRows, monsterRow.describeId);
    if (!codexRow) throw new InvalidOperationError(Operation.Read, String(enemyKindId), "has no archive entry");
    const monsterDescribeRow = monsterDescribeRows.find(({ id }) => id === monsterRow.describeId);
    if (!monsterDescribeRow)
      throw new InvalidOperationError(Operation.Read, String(enemyKindId), "has no monster description");
    return {
      archiveEntryId: codexRow.id,
      attackCurve: getGrowCurve(monsterRow, BASE_ATTACK_PROPERTY),
      baseAttack: monsterRow.attackBase,
      baseDefense: monsterRow.defenseBase,
      baseHealth: monsterRow.hpBase,
      defenseCurve: getGrowCurve(monsterRow, BASE_DEFENSE_PROPERTY),
      elementResistances: {
        Electric: monsterRow.elecSubHurt,
        Fire: monsterRow.fireSubHurt,
        Grass: monsterRow.grassSubHurt,
        Ice: monsterRow.iceSubHurt,
        Rock: monsterRow.rockSubHurt,
        Water: monsterRow.waterSubHurt,
        Wind: monsterRow.windSubHurt,
      },
      enemyFamily: codexRow.subType ?? DEFAULT_CODEX_SUBTYPE,
      enemyType: monsterRow.securityLevel ?? DEFAULT_SECURITY_LEVEL,
      healthCurve: getGrowCurve(monsterRow, BASE_HEALTH_PROPERTY),
      id: enemyKindId,
      nameTextId: String(monsterDescribeRow.nameTextMapHash),
      physicalResistance: monsterRow.physicalSubHurt,
    };
  });
  const curves = new Set(
    enemyKinds.flatMap(({ attackCurve, defenseCurve, healthCurve }) => [attackCurve, defenseCurve, healthCurve]),
  );
  const levelCurves = Object.fromEntries(
    [...curves].toSorted().map((curve) => [curve, toLevelCurve(monsterCurveRows, curve)]),
  );
  return { [`${GameDataset.Enemies}/kinds`]: enemyKinds, [`${GameDataset.Enemies}/levelCurves`]: levelCurves };
};
