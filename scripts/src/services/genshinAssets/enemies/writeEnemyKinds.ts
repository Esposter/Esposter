import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";
import type { ExcelMonsterDescribeRow } from "#src/models/genshinAssets/enemies/ExcelMonsterDescribeRow";
import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";
import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";

import {
  ANIMAL_CODEX_TABLE_FILENAME,
  BASE_ATTACK_PROPERTY,
  BASE_DEFENSE_PROPERTY,
  BASE_HEALTH_PROPERTY,
  ENEMY_KINDS_PATH,
  ENEMY_LEVEL_CURVES_PATH,
  MONSTER_CODEX_TYPE,
  MONSTER_CURVE_TABLE_FILENAME,
  MONSTER_DESCRIBE_TABLE_FILENAME,
  MONSTER_TABLE_FILENAME,
  REGIONS_DIRECTORY,
} from "#src/services/genshinAssets/enemies/constants";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const readExcelTable = async <T>(filename: string): Promise<T[]> =>
  parseMachineJson<T[]>(await readFile(join(EXCEL_DIRECTORY, filename), "utf8"));

const getGrowCurve = ({ id, propGrowCurves }: MonsterRow, property: string): string => {
  const growCurve = propGrowCurves.find(({ type }) => type === property)?.growCurve;
  if (!growCurve) throw new InvalidOperationError(Operation.Read, String(id), `grows ${property} by no curve`);
  return growCurve;
};
// The kinds every region's camps place, each read from the game's monster table with its family from the archive and
// Its name's text id, and every level curve they name, written as the world's kinds and level curves tables. A kind the tables lack is an
// Error. The resistances are keyed by the world's elements, spelt as the game's tables spell them, which the world's
// Schema checks. Returns the files' paths
export const writeEnemyKinds = async (): Promise<string[]> => {
  const regionsDirectory = join(WORLD_DATA_DIRECTORY, REGIONS_DIRECTORY);
  const regionFilenames = await readdir(regionsDirectory);
  const [regionDatas, monsterRows, monsterDescribeRows, monsterCurveRows, animalCodexRows] = await Promise.all([
    Promise.all(
      regionFilenames.map(async (filename) =>
        parseMachineJson<{ enemyCamps: { members: { enemyKindId: number }[] }[] }>(
          await readFile(join(regionsDirectory, filename), "utf8"),
        ),
      ),
    ),
    readExcelTable<MonsterRow>(MONSTER_TABLE_FILENAME),
    readExcelTable<ExcelMonsterDescribeRow>(MONSTER_DESCRIBE_TABLE_FILENAME),
    readExcelTable<MonsterCurveRow>(MONSTER_CURVE_TABLE_FILENAME),
    readExcelTable<AnimalCodexRow>(ANIMAL_CODEX_TABLE_FILENAME),
  ]);
  const enemyKindIds = new Set(
    regionDatas.flatMap(({ enemyCamps }) =>
      enemyCamps.flatMap(({ members }) => members.map(({ enemyKindId }) => enemyKindId)),
    ),
  );
  const enemyKinds = [...enemyKindIds]
    .toSorted((firstId, secondId) => firstId - secondId)
    .map((enemyKindId) => {
      const monsterRow = monsterRows.find(({ id }) => id === enemyKindId);
      if (!monsterRow) throw new InvalidOperationError(Operation.Read, String(enemyKindId), "has no monster row");
      const codexRow = animalCodexRows.find(
        ({ describeId, type }) => type === MONSTER_CODEX_TYPE && describeId === monsterRow.describeId,
      );
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
        enemyFamily: codexRow.subType,
        enemyType: monsterRow.securityLevel,
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
        const value = curveInfos.find(({ type }) => type === curve)?.value;
        if (value === undefined) throw new InvalidOperationError(Operation.Read, curve, `has no level ${level}`);
        return value;
      }),
    ]),
  );
  return Promise.all([
    writeWorldData(ENEMY_KINDS_PATH, enemyKinds),
    writeWorldData(ENEMY_LEVEL_CURVES_PATH, levelCurves),
  ]);
};
