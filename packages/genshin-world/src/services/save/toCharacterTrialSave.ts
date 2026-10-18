import type { CharacterTrialSave } from "#src/models/trial/CharacterTrialSave";

// The claimed stages in ascending order, so the same progress always saves the same bytes
export const toCharacterTrialSave = (claimedStageIds: ReadonlySet<number>): CharacterTrialSave => ({
  claimedStageIds: [...claimedStageIds].toSorted((first, second) => first - second),
});
