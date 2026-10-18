import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { computeHomeTrustRank } from "#src/services/home/computeHomeTrustRank";

// The progress after a character is invited to live in the realm, up to the companions its Trust Rank holds. Undefined,
// With nothing invited, where the character is the Traveler, is not owned, already lives there, or the count is full
export const inviteHomeCompanion = (
  characterId: number,
  {
    levels,
    ownedCharacterIds,
    progress,
  }: { levels: HomeTrustLevel[]; ownedCharacterIds: number[]; progress: HomeProgress },
): HomeProgress | undefined => {
  const trustRank = computeHomeTrustRank(progress.trustExp, levels);
  const npcCount = levels.find(({ level }) => level === trustRank)?.npcCount ?? 0;
  if (
    characterId === TRAVELER_CHARACTER_ID ||
    !ownedCharacterIds.includes(characterId) ||
    progress.companionIds.includes(characterId) ||
    progress.companionIds.length >= npcCount
  )
    return undefined;
  return { ...progress, companionIds: [...progress.companionIds, characterId] };
};
