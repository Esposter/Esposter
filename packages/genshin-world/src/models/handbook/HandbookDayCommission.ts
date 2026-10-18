import type { GameTextKey } from "genshin-text";

// One of the day's commissions as the Adventurer Handbook's Commissions tab lists it: its id to claim it by, its title's name
// Text id, the game's name of the region it is preferred in when one is named, its progress against the count that finishes
// It, and whether it is claimed already or can be claimed now
export interface HandbookDayCommission {
  commissionId: number;
  isClaimable: boolean;
  isClaimed: boolean;
  nameTextId: string;
  progress: number;
  regionTextKey?: GameTextKey;
  total: number;
}
