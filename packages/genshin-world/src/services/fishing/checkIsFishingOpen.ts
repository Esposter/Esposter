// Whether fishing is offered at a point: the player owns the Serenitea Pot and has finished its quest. The realm's
// Adventure Rank does not gate it
export const checkIsFishingOpen = ({
  isSereniteaPotOwned,
  isSereniteaPotQuestFinished,
}: {
  isSereniteaPotOwned: boolean;
  isSereniteaPotQuestFinished: boolean;
}): boolean => isSereniteaPotOwned && isSereniteaPotQuestFinished;
