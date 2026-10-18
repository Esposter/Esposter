import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";

// Each field of a schedule row under the key the 7.1 dump holds it at, the two scrambled keys named by their evidence
export const ExcelRoleCombatScheduleRowFieldDumpKeyMap: Readonly<Record<keyof ExcelRoleCombatScheduleRow, string>> = {
  avatarConfigId: "avatarConfigId",
  beginTimeStr: "beginTimeStr",
  difficultyIds: "LNCBPPGCCOA",
  endTimeStr: "IENPIBICGCC",
  rewardGroupId: "rewardGroupId",
  scheduleId: "scheduleId",
};
