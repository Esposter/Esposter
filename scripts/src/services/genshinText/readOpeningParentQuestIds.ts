import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The quests a city's opening waits on, each named by one of its wiki titles: the one quest a title names, dropping the
// Opening's own world quest, since a quest cannot wait on itself. A title naming no single quest is an error, so a title
// That drifts from the dump cannot leave a gate unlinked
export const readOpeningParentQuestIds = (
  titles: readonly string[],
  mainQuestId: number,
  titleQuestIds: ReadonlyMap<string, readonly number[]>,
): number[] => {
  const parentQuestIds = titles.map((title) => {
    const questIds = titleQuestIds.get(title);
    if (questIds?.length !== 1)
      throw new InvalidOperationError(Operation.Read, title, "names no single quest or chapter in the dump");
    return takeOne(questIds);
  });
  return [...new Set(parentQuestIds)].filter((parentQuestId) => parentQuestId !== mainQuestId);
};
