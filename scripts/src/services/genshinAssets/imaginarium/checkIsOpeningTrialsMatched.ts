import type { TrialAvatar } from "genshin-world";

// Whether a season's trial avatars are its opening characters, each opener playing as exactly one of them: a season whose
// Trial avatars name another character, or name one twice, does not match
export const checkIsOpeningTrialsMatched = (openingCharacterIds: number[], openingTrials: TrialAvatar[]): boolean => {
  const openingIds = openingCharacterIds.toSorted(
    (firstCharacterId, secondCharacterId) => firstCharacterId - secondCharacterId,
  );
  const trialCharacterIds = openingTrials
    .map(({ characterId }) => characterId)
    .toSorted((firstCharacterId, secondCharacterId) => firstCharacterId - secondCharacterId);
  return (
    trialCharacterIds.length === openingIds.length && trialCharacterIds.every((id, index) => id === openingIds[index])
  );
};
