import { DailyTaskFinishKind } from "#src/models/genshinAssets/commissions/DailyTaskFinishKind";
import { CommissionFinishKind } from "genshin-world";

// Each daily task's finish in the dump's table, as the world names what finishes it
export const DailyTaskFinishKindMap: Readonly<Record<string, CommissionFinishKind>> = {
  [DailyTaskFinishKind.DailyFinishChallenge]: CommissionFinishKind.Challenge,
  [DailyTaskFinishKind.DailyFinishGadgetIdNum]: CommissionFinishKind.Gadget,
  [DailyTaskFinishKind.DailyFinishMonsterNum]: CommissionFinishKind.Monster,
  [DailyTaskFinishKind.DailyFinishNone]: CommissionFinishKind.None,
};
