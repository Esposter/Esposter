import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";
import type { ImaginariumStageFight } from "#src/models/imaginarium/ImaginariumStageFight";
import type { DomainChallengeProgress } from "#src/services/domains/resolveDomainChallenge";

import { checkIsImaginariumStageReady } from "#src/services/imaginarium/checkIsImaginariumStageReady";
import { performImaginariumStage } from "#src/services/imaginarium/performImaginariumStage";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";

export const fightImaginariumStage = (
  principalCast: ImaginariumMember[],
  progress: DomainChallengeProgress,
  isPartyDown: boolean,
): ImaginariumStageFight => {
  if (!checkIsImaginariumStageReady(principalCast)) return { isFought: false, principalCast };
  return {
    isFought: true,
    outcome: resolveDomainChallenge(progress, { isPartyDown }),
    principalCast: performImaginariumStage(principalCast),
  };
};
