import type { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

// A stage's fight: refused, leaving the Principal Cast as it was, unless four performers each hold Vigor. Once fought,
// Each performer spends one Vigor and the stage's arena challenge gives its outcome, the same rules a domain's challenge
// Runs by
export type ImaginariumStageFight =
  | { isFought: false; principalCast: ImaginariumMember[] }
  | { isFought: true; outcome: DomainChallengeOutcome; principalCast: ImaginariumMember[] };
