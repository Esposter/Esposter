// A threshold relative to the clip's loudest frame rather than absolute, since the game's lines and the service's
// Output are mastered to different levels and the same number of decibels down means the same thing in both
export const getFloorDb = (energiesDb: number[], belowPeakDb: number): number => Math.max(...energiesDb) - belowPeakDb;
