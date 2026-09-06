import type { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";

export interface SkillDocsFinding {
  detail: string;
  path: string;
  type: SkillDocsFindingType;
}
