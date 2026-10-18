import type { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";
import type { DomainChallengeProgress } from "#src/services/domains/resolveDomainChallenge";

import { checkIsImaginariumStageReady } from "#src/services/imaginarium/checkIsImaginariumStageReady";
import { performImaginariumStage } from "#src/services/imaginarium/performImaginariumStage";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";

// A stage's fight: refused, leaving the Principal Cast as it was, unless four performers each hold Vigor. Once fought,
// Each performer spends one Vigor and the stage's arena challenge gives its outcome, the same rules a domain's challenge
// Runs by
export type ImaginariumStageFight =
  | { isFought: false; principalCast: ImaginariumMember[] }
  | { isFought: true; outcome: DomainChallengeOutcome; principalCast: ImaginariumMember[] };

export const fightImaginariumStage = (
  principalCast: ImaginariumMember[],
  progress: DomainChallengeProgress,
  partyDown: boolean,
): ImaginariumStageFight => {
  if (!checkIsImaginariumStageReady(principalCast)) return { isFought: false, principalCast };
  return {
    isFought: true,
    outcome: resolveDomainChallenge(progress, { partyDown }),
    principalCast: performImaginariumStage(principalCast),
  };
};
