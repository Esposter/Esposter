// A stance's normal attacks as gcsim's attack state gives them: the record path they are written at, the state of gcsim's
// Attack hitboxes whose boxes they take, and the skill label whose table multiplies each hit's multiplier, as gcsim's
// Snapshot multiplies an enhanced normal attack by its skill's table
export interface GcsimStanceNormalAttack {
  factorLabel: string;
  path: string;
  state: number;
}
