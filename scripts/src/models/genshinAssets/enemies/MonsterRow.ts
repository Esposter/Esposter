// The fields read off one row of the game's monster table: its id, its security level, the description its archive
// Entry is filed under, its name's text id, its base stats and the curve each grows by, and the share of each damage
// Type it resists
export interface MonsterRow {
  attackBase: number;
  defenseBase: number;
  describeId: number;
  elecSubHurt: number;
  fireSubHurt: number;
  grassSubHurt: number;
  hpBase: number;
  iceSubHurt: number;
  id: number;
  physicalSubHurt: number;
  propGrowCurves: { growCurve: string; type: string }[];
  rockSubHurt: number;
  securityLevel: string;
  waterSubHurt: number;
  windSubHurt: number;
}
