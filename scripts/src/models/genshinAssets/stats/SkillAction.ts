// A constellation's skill action in the dump's talent configs, in one of its two shapes: the first with its names
// Scrambled, the second plain. Each names the skill by its slot and the levels it adds, and reads to the same thing
export interface SkillAction {
  levels: number;
  slot: number;
}
