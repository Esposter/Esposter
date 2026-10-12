// One `AttackInfo` literal of a gcsim character's action files, its fields as written: the talent variable its
// multiplier reads, through any loop or local naming it, its attack and ICD tags, strike type and element by their gcsim
// names, and its durability and poise where they evaluate to a number, else the variable the poise indexes by the
// attack's place in its string. The line is the literal's, and each field keeps its own. The name the literal is
// assigned to with `:=`, which a call passes it by
export interface GcsimAttack {
  attackTag?: string;
  durability?: number;
  element?: string;
  fieldLineMap: Partial<Record<string, number>>;
  file: string;
  internalCooldownTag?: string;
  line: number;
  poiseDamage?: number;
  poiseDamageVariable?: string;
  strikeType?: string;
  talentVariable?: string;
  variableName?: string;
}
