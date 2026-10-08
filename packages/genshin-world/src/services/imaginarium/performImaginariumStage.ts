import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

// The Principal Cast after it performs a stage, each member one Vigor poorer. The caller checks the cast is ready first
export const performImaginariumStage = (principalCast: ImaginariumMember[]): ImaginariumMember[] =>
  principalCast.map((member) => ({ ...member, vigor: member.vigor - 1 }));
