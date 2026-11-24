// A stance's normal attacks as gcsim's attack state gives them: the record path they are written at, the state of
// Gcsim's attack hitboxes whose boxes they take, and the skill label whose table multiplies each hit's multiplier, as
// Gcsim's snapshot multiplies an enhanced normal attack by its skill's table
export interface GcsimStanceNormalAttack {
  factorLabel: string;
  path: string;
  state: number;
}
