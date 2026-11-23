import { FORGE_DAILY_POINT_CAP_CONST_NAME } from "#src/services/genshinAssets/forging/constants";
import { readConstValue } from "#src/services/genshinAssets/shared/readConstValue";
import { takeOne } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { z } from "zod";

// The most forge points a game day holds, the game's own constant of that name, under the forging dataset's `dailyPointCap`
export const buildForgingDailyPointCap = (): Record<string, unknown> => ({
  [`${GameDataset.Forging}/dailyPointCap`]: z
    .int()
    .positive()
    .parse(Number(takeOne(readConstValue(FORGE_DAILY_POINT_CAP_CONST_NAME)))),
});
