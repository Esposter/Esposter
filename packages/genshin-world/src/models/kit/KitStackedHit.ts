// A hit whose damage and poise are set by the stacks of a status on each enemy it strikes, and which consumes the status:
// Each list holds the multiplier or poise at each count of stacks, from none up
export interface KitStackedHit {
  poiseDamages: number[];
  statusId: string;
  talentMultipliers: number[];
}
