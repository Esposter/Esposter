import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { IMAGINARIUM_PERFORMER_COUNT } from "#src/services/imaginarium/constants";

// Whether a Principal Cast can perform a stage: exactly as many characters as a stage takes, each with Vigor left to spend
export const checkIsImaginariumStageReady = (principalCast: ImaginariumMember[]): boolean =>
  principalCast.length === IMAGINARIUM_PERFORMER_COUNT && principalCast.every(({ vigor }) => vigor > 0);
