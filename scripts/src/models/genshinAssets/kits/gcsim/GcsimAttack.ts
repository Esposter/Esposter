// One `AttackInfo` literal of a gcsim character's action files, its fields as written: the talent variable its
// Multiplier reads, through any loop or local naming it, its attack and ICD tags, strike type and element by their gcsim
// Names, and its durability and poise where they evaluate to a number, else the variable the poise indexes by the
// Attack's place in its string. The line is the literal's, and each field keeps its own. The name the literal is
// Assigned to with `:=`, which a call passes it by
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
  // The line of the declaration the attack is made from: its literal's, or a copy's own line, shared by every `Mult` set
  // Under it, so the calls of one declaration can be told from another's
  siteLine: number;
  talentVariable?: string;
  variableName?: string;
}
