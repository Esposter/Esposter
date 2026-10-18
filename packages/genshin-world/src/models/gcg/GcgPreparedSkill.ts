import type { GcgSkill } from "#src/models/gcg/GcgSkill";

// A skill a side prepared on an earlier turn: the character that prepared it, and the skill it runs at its side's next turn
export interface GcgPreparedSkill {
  characterIndex: number;
  skill: GcgSkill;
}
