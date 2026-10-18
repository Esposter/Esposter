// Whether fishing is offered at a point: the player holds the Serenitea Pot, and the quest that unlocks it is finished
// Once it is carried. Undefined while the save does not carry that quest, and then the Pot alone opens fishing, which is
// Provisional until the quest is carried. The realm's Adventure Rank does not gate it
export const checkIsFishingOpen = ({
  isSereniteaPotOwned,
  isSereniteaPotQuestFinished,
}: {
  isSereniteaPotOwned: boolean;
  isSereniteaPotQuestFinished: boolean | undefined;
}): boolean => isSereniteaPotOwned && (isSereniteaPotQuestFinished ?? true);
