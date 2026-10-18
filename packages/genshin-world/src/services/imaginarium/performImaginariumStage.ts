import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

// The Principal Cast after it performs a stage: each member one Vigor poorer, and every member starting the stage at full
// Health, a health share of one, and full energy, its Burst's cost. The caller checks the cast is ready first
export const performImaginariumStage = (principalCast: ImaginariumMember[]): ImaginariumMember[] =>
  principalCast.map((member) => ({
    ...member,
    energy: member.burstEnergyCost,
    healthShare: 1,
    vigor: member.vigor - 1,
  }));
