import type { GcgCost, GcgSkillKind } from "genshin-world";

export interface GcgDeckSliceSkill {
  costs: GcgCost[];
  effect: string;
  energyGain: number;
  id: number;
  kind: GcgSkillKind;
}
