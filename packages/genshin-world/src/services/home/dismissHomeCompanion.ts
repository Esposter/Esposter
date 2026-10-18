import type { HomeProgress } from "#src/models/home/HomeProgress";

// The progress after a character is dismissed from living in the realm. A character not living there is left as it is
export const dismissHomeCompanion = (characterId: number, progress: HomeProgress): HomeProgress => ({
  ...progress,
  companionIds: progress.companionIds.filter((companionId) => companionId !== characterId),
});
