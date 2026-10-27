import { CommissionKind } from "genshin-world";
import { DailyTaskTypeKind } from "#src/models/genshinAssets/commissions/DailyTaskTypeKind";

// Each daily task's type in the dump's table, as the world names its kind
export const DailyTaskTypeKindMap: Readonly<Record<string, CommissionKind>> = {
  [DailyTaskTypeKind.DailyTaskQuest]: CommissionKind.Quest,
  [DailyTaskTypeKind.DailyTaskScene]: CommissionKind.Scene,
};
