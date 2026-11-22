import { DailyTaskFinishKind } from "#src/models/genshinAssets/commissions/DailyTaskFinishKind";
import { checkIsEnumValue } from "@esposter/shared";

export const checkIsDailyTaskFinishKind = (value: string): value is DailyTaskFinishKind =>
  checkIsEnumValue(DailyTaskFinishKind, value);
