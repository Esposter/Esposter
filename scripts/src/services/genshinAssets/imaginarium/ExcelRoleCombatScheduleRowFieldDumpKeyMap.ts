import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";
import { ExcelRoleCombatScheduleRowFieldDumpKey } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRowFieldDumpKey";

// Each field of a schedule row under the key the 7.1 dump holds it at, the two scrambled keys named by their evidence
export const ExcelRoleCombatScheduleRowFieldDumpKeyMap: Readonly<Record<keyof ExcelRoleCombatScheduleRow, string>> = {
  [ExcelRoleCombatScheduleRowFieldDumpKey.AvatarConfigId]: "avatarConfigId",
  [ExcelRoleCombatScheduleRowFieldDumpKey.BeginTimeStr]: "beginTimeStr",
  [ExcelRoleCombatScheduleRowFieldDumpKey.DifficultyIds]: "LNCBPPGCCOA",
  [ExcelRoleCombatScheduleRowFieldDumpKey.EndTimeStr]: "IENPIBICGCC",
  [ExcelRoleCombatScheduleRowFieldDumpKey.RewardGroupId]: "rewardGroupId",
  [ExcelRoleCombatScheduleRowFieldDumpKey.ScheduleId]: "scheduleId",
};
