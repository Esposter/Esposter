import { CommissionFinishKind } from "genshin-world";

// Each daily task's finish in the dump's table, as the world names what finishes it
export const DailyTaskFinishKindMap: Readonly<Record<string, CommissionFinishKind>> = {
  DAILY_FINISH_CHALLENGE: CommissionFinishKind.Challenge,
  DAILY_FINISH_GADGET_ID_NUM: CommissionFinishKind.Gadget,
  DAILY_FINISH_MONSTER_NUM: CommissionFinishKind.Monster,
  DAILY_FINISH_NONE: CommissionFinishKind.None,
};
