import { DailyTaskTypeKind } from "#src/models/genshinAssets/commissions/DailyTaskTypeKind";
import { checkIsEnumValue } from "@esposter/shared";

export const checkIsDailyTaskTypeKind = (value: string): value is DailyTaskTypeKind =>
  checkIsEnumValue(DailyTaskTypeKind, value);
