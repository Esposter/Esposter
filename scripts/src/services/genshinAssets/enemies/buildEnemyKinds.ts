import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";
import type { ExcelMonsterDescribeRow } from "#src/models/genshinAssets/enemies/ExcelMonsterDescribeRow";
import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";
import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";
import type { RegionCampsData } from "#src/models/genshinAssets/enemies/RegionCampsData";

import { ANIMAL_CODEX_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { collectEnemyKindIds } from "#src/services/genshinAssets/enemies/collectEnemyKindIds";
import {
  BASE_ATTACK_PROPERTY,
  BASE_DEFENSE_PROPERTY,
  BASE_HEALTH_PROPERTY,
  DEFAULT_CODEX_SUBTYPE,
  DEFAULT_SECURITY_LEVEL,
  MONSTER_CURVE_TABLE_NAME,
  MONSTER_DESCRIBE_TABLE_NAME,
  MONSTER_TABLE_NAME,
  REGIONS_DIRECTORY,
  WEEKLY_BOSS_KIND_IDS,
} from "#src/services/genshinAssets/enemies/constants";
import { findMonsterCodexRow } from "#src/services/genshinAssets/enemies/findMonsterCodexRow";
import { getGrowCurve } from "#src/services/genshinAssets/enemies/getGrowCurve";
import { MONDSTADT_BOUNTY_TARGET_NAMES } from "#src/services/genshinAssets/reputation/constants";
import { readMonsterNames } from "#src/services/genshinAssets/reputation/readMonsterNames";
import { toBountyTargetIds } from "#src/services/genshinAssets/reputation/toBountyTargetIds";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readAbyssDescribeIds } from "#src/services/genshinAssets/spiralAbyss/readAbyssDescribeIds";
import { readAbyssFloors } from "#src/services/genshinAssets/spiralAbyss/readAbyssFloors";
import { toAbyssEnemyKinds } from "#src/services/genshinAssets/spiralAbyss/toAbyssEnemyKinds";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// The kinds every region's camps place and every Mondstadt bounty, weekly boss and Spiral Abyss chamber fights, each read
// From the game's monster table with its family from the archive and its name's text id, and every level curve they name,
// As the records of the enemies dataset. A kind the tables lack is an Error. The resistances are keyed by the world's
// Elements, spelt as the game's tables spell them, which the world's schema checks. Returns the records the kinds and
// Curves publish under
export const buildEnemyKinds = async (): Promise<Record<string, unknown>> => {
  const regionsDirectory = join(WORLD_DATA_DIRECTORY, REGIONS_DIRECTORY);
  const regionFilenames = await readdir(regionsDirectory);
  const regionDatas = await Promise.all(
    regionFilenames.map(async (filename) =>
      parseMachineJson<RegionCampsData>(await readFile(join(regionsDirectory, filename), "utf8")),
    ),
  );
  const monsterRows = readExcelTable<MonsterRow>(MONSTER_TABLE_NAME);
  const monsterDescribeRows = readExcelTable<ExcelMonsterDescribeRow>(MONSTER_DESCRIBE_TABLE_NAME);
  const monsterCurveRows = readExcelTable<MonsterCurveRow>(MONSTER_CURVE_TABLE_NAME);
  const animalCodexRows = readExcelTable<AnimalCodexRow>(ANIMAL_CODEX_TABLE_NAME);
  const monsterNames = readMonsterNames();
  const bountyKindIds = Object.values(MONDSTADT_BOUNTY_TARGET_NAMES).flatMap((names) =>
    toBountyTargetIds(names, monsterNames),
  );
  const abyssEnemyKindIds = Object.values(
    toAbyssEnemyKinds(readAbyssDescribeIds(readAbyssFloors(), animalCodexRows), monsterRows),
  );
  const extraKindIds = [...bountyKindIds, ...WEEKLY_BOSS_KIND_IDS, ...abyssEnemyKindIds];
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
  const levelRows = monsterCurveRows.toSorted((firstRow, secondRow) => firstRow.level - secondRow.level);
  const levelCurves = Object.fromEntries(
    [...curves].toSorted().map((curve) => [
      curve,
      levelRows.map(({ curveInfos, level }) => {
        const value = curveInfos.find(({ type }) => type === curve)?.GGKIEIJLCJJ;
        if (value === undefined) throw new InvalidOperationError(Operation.Read, curve, `has no level ${level}`);
        return value;
      }),
    ]),
  );
  return { [`${GameDataset.Enemies}/kinds`]: enemyKinds, [`${GameDataset.Enemies}/levelCurves`]: levelCurves };
};
