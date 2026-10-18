import type { GameTextKey } from "genshin-text";

// One of the day's commissions as the Adventurer Handbook's Commissions tab lists it: its title's name text id, the game's
// Name of the region it is preferred in, when one is named, and its progress against the count that finishes it
export interface HandbookDayCommission {
  nameTextId: string;
  progress: number;
  regionTextKey: GameTextKey | undefined;
  total: number;
}
