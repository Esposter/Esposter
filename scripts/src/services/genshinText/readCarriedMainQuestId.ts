// The main quest a carried quest's steps are read from: its own id when the quest table has a row for it, else the main
// Quest its sub quest is part of, or none when neither has a row
export const readCarriedMainQuestId = (
  questId: number,
  mainQuestIds: ReadonlySet<number>,
  mainIdBySubId: ReadonlyMap<number, number>,
): number | undefined => {
  if (mainQuestIds.has(questId)) return questId;
  const mainId = mainIdBySubId.get(questId);
  return mainId !== undefined && mainQuestIds.has(mainId) ? mainId : undefined;
};
