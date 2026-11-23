import type { ExcelConstValueRow } from "#src/models/genshinAssets/forging/ExcelConstValueRow";

import {
  CONST_VALUE_TABLE_NAME,
  FORGE_DAILY_POINT_CAP_CONST_NAME,
} from "#src/services/genshinAssets/forging/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { takeOne } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { z } from "zod";

// The most forge points a game day holds, the game's own constant of that name, under the forging dataset's `dailyPointCap`.
// The constant table keys its value list under a scrambled name, which the reader gives back as `value`
export const buildForgingDailyPointCap = (): Record<string, unknown> => {
  const row = takeOne(
    readExcelTable<ExcelConstValueRow>(CONST_VALUE_TABLE_NAME, { name: "name", value: "CBOMLBFIPJM" }).filter(
      ({ name }) => name === FORGE_DAILY_POINT_CAP_CONST_NAME,
    ),
  );
  return {
    [`${GameDataset.Forging}/dailyPointCap`]: z
      .int()
      .positive()
      .parse(Number(takeOne(row.value))),
  };
};
