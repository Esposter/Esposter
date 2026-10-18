import type { QuestWait } from "#src/models/quest/QuestWait";

// A wait as the target id its objective names, its days then its hours: "1:18-6" is a day on, from eighteen to six
export const formatQuestWaitTargetId = ({ days, fromHour, toHour }: QuestWait): string =>
  `${days}:${fromHour}-${toHour}`;
