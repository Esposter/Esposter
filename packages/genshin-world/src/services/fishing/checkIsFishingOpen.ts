// Whether fishing is offered at a point: the player holds the Serenitea Pot, and its unlocking quest is finished.
// Undefined while the save does not carry that quest, and then the Pot alone opens fishing.
// That is provisional until the quest is carried.
// The realm's Adventure Rank does not gate it.
export const checkIsFishingOpen = ({
  isSereniteaPotOwned,
  isSereniteaPotQuestFinished,
}: {
  isSereniteaPotOwned: boolean;
  isSereniteaPotQuestFinished?: boolean | undefined;
}): boolean => isSereniteaPotOwned && (isSereniteaPotQuestFinished ?? true);
