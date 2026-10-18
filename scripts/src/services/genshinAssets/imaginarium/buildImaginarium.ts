import type { ExcelRoleCombatAvatarConfigRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRow";
import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";
import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";

import {
  ROLE_COMBAT_AVATAR_CONFIG_TABLE_NAME,
  ROLE_COMBAT_DIFFICULTY_TABLE_NAME,
  ROLE_COMBAT_SCHEDULE_TABLE_NAME,
} from "#src/services/genshinAssets/imaginarium/constants";
import { checkIsOpeningElementsMatched } from "#src/services/genshinAssets/imaginarium/checkIsOpeningElementsMatched";
import { toImaginariumDifficulty } from "#src/services/genshinAssets/imaginarium/toImaginariumDifficulty";
import { toImaginariumSeason } from "#src/services/genshinAssets/imaginarium/toImaginariumSeason";
import { getCharacterDatas } from "#src/services/genshinAssets/stats/getCharacterDatas";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The Imaginarium Theater's seasons and difficulties from the role combat tables, each published as a record of the
// Imaginarium dataset. A season names its difficulties by id, and a season whose opening characters do not hold its three
// Elements, or that names a difficulty the table lacks, is refused
export const buildImaginarium = (): Record<string, unknown> => {
  const difficulties = readExcelTable<ExcelRoleCombatDifficultyRow>(ROLE_COMBAT_DIFFICULTY_TABLE_NAME)
    .map((row) => toImaginariumDifficulty(row))
    .toSorted((firstDifficulty, secondDifficulty) => firstDifficulty.id - secondDifficulty.id);
  const difficultyIds = new Set(difficulties.map(({ id }) => id));
  const avatarConfigRowMap = new Map(
    readExcelTable<ExcelRoleCombatAvatarConfigRow>(ROLE_COMBAT_AVATAR_CONFIG_TABLE_NAME).map((row) => [
      row.avatarConfigId,
      row,
    ]),
  );
  const characterElementMap = new Map(getCharacterDatas([]).map(({ element, id }) => [id, element]));
  const seasons = readExcelTable<ExcelRoleCombatScheduleRow>(ROLE_COMBAT_SCHEDULE_TABLE_NAME)
    .map((row) => {
      const avatarConfigRow = avatarConfigRowMap.get(row.avatarConfigId);
      if (!avatarConfigRow)
        throw new InvalidOperationError(
          Operation.Read,
          String(row.scheduleId),
          `joins avatar config ${row.avatarConfigId}, which the table lacks`,
        );
      return toImaginariumSeason(row, avatarConfigRow);
    })
    .toSorted((firstSeason, secondSeason) => firstSeason.id - secondSeason.id);
  for (const season of seasons) {
    const missingId = season.difficultyIds.find((id) => !difficultyIds.has(id));
    if (missingId !== undefined)
      throw new InvalidOperationError(
        Operation.Read,
        String(season.id),
        `names difficulty ${missingId}, which the table lacks`,
      );
    const openingElements = season.openingCharacterIds.map((characterId) => characterElementMap.get(characterId));
    if (!checkIsOpeningElementsMatched(season.elements, openingElements))
      throw new InvalidOperationError(
        Operation.Read,
        String(season.id),
        "names openers whose elements are not its three",
      );
  }
  return { [`${GameDataset.Imaginarium}/difficulties`]: difficulties, [`${GameDataset.Imaginarium}/seasons`]: seasons };
};
