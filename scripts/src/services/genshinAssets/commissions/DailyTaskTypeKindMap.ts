import { DailyTaskTypeKind } from "#src/models/genshinAssets/commissions/DailyTaskTypeKind";
import { CommissionKind } from "genshin-world";

// Each daily task's type in the dump's table, as the world names its kind
export const DailyTaskTypeKindMap: Readonly<Record<string, CommissionKind>> = {
  [DailyTaskTypeKind.DailyTaskQuest]: CommissionKind.Quest,
  [DailyTaskTypeKind.DailyTaskScene]: CommissionKind.Scene,
};
