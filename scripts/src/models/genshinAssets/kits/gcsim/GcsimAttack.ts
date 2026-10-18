import type { GcsimAttackBranch } from "#src/models/genshinAssets/kits/gcsim/GcsimAttackBranch";
import type { GcsimAttackIteration } from "#src/models/genshinAssets/kits/gcsim/GcsimAttackIteration";

// One `AttackInfo` literal of a gcsim character's action files, its fields as written: the talent variable its
// Multiplier reads, through any loop or local naming it, its attack and ICD tags and element by their gcsim
// Names, and its durability and poise where they evaluate to a number, else the variable the poise indexes by the
// Attack's place in its string. The line is the literal's, and each field keeps its own. The name the literal is
// Assigned to with `:=`, which a call passes it by. Its `Abil` is the text the literal gives it, a string or a string constant
// Of its file, as the attack's name
export interface GcsimAttack {
  abil?: string;
  // The if or else the attack's `Mult` set sits in, or the literal's own, which a call after the branches fires per branch
  branch?: GcsimAttackBranch;
  attackTag?: string;
  durability?: number;
  element?: string;
  fieldLineMap: Partial<Record<string, number>>;
  file: string;
  internalCooldownTag?: string;
  // The loop iteration this variant applies to, where an if on a constant loop's variable sets a field on a copy, or a
  // Literal's element is a slice entry its loop variable indexes: a call takes it only in that iteration, and the copy's
  // Own attack, or the literal's other iterations, in the others
  iteration?: GcsimAttackIteration;
  line: number;
  poiseDamage?: number;
  poiseDamageVariable?: string;
  // The line of the declaration the attack is made from: its literal's, or a copy's own line, shared by every `Mult` set
  // Under it, so the calls of one declaration can be told from another's
  siteLine: number;
  talentVariable?: string;
  variableName?: string;
}
