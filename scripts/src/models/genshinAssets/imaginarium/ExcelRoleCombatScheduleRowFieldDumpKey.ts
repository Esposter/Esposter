export const ExcelRoleCombatScheduleRowFieldDumpKey = {
  AvatarConfigId: "avatarConfigId",
  BeginTimeStr: "beginTimeStr",
  DifficultyIds: "difficultyIds",
  EndTimeStr: "endTimeStr",
  RewardGroupId: "rewardGroupId",
  ScheduleId: "scheduleId",
} as const;
export type ExcelRoleCombatScheduleRowFieldDumpKey =
  (typeof ExcelRoleCombatScheduleRowFieldDumpKey)[keyof typeof ExcelRoleCombatScheduleRowFieldDumpKey];
