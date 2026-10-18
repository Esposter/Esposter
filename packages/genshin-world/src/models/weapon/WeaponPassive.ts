// A weapon's passive as its screen shows it: its name, and each refinement rank's description in refinement order, the
// Rank the weapon holds marked
export interface WeaponPassive {
  name: string;
  rows: { description: string; isHeld: boolean }[];
}
