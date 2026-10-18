// The Stellas a run holds after an act ends: one more when its star challenge is met, none when it is not
export const gainImaginariumStella = (stellas: number, isStarChallengeMet: boolean): number =>
  isStarChallengeMet ? stellas + 1 : stellas;
