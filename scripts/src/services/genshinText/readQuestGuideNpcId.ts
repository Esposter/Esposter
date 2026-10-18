// The NPC a sub quest's guide names, read by its shape since the dump scrambles every name: the guide is an object holding
// The type QUEST_GUIDE_NPC, and the first entry of its list of ids is the NPC's id. A sub quest with no such guide names none
export const readQuestGuideNpcId = (subQuest: Record<string, unknown>): string | undefined => {
  const guide = Object.values(subQuest).find(
    (value): value is Record<string, unknown> =>
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.values(value).includes("QUEST_GUIDE_NPC"),
  );
  const [npcId] = Object.values(guide ?? {}).find((value): value is unknown[] => Array.isArray(value)) ?? [];
  return typeof npcId === "string" ? npcId : undefined;
};
