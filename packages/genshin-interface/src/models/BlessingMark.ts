// The traced marks the Blessing screen draws: the drop in the ring's centre and the statue's mark at the title's left
export const BlessingMark = { Drop: "Drop", Statue: "Statue" } as const;
export type BlessingMark = (typeof BlessingMark)[keyof typeof BlessingMark];
