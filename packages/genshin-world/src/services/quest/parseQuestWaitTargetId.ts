import type { QuestWait } from "#src/models/quest/QuestWait";

// The wait a target id names, undefined for one that is not a wait's
export const parseQuestWaitTargetId = (targetId: string): QuestWait | undefined => {
  const groups = /^(?<days>\d+):(?<fromHour>\d+)-(?<toHour>\d+)$/u.exec(targetId)?.groups;
  if (!groups) return undefined;
  return { days: Number(groups.days), fromHour: Number(groups.fromHour), toHour: Number(groups.toHour) };
};
