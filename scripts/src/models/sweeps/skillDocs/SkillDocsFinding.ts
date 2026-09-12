import type { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";

export interface SkillDocsFinding {
  detail: string;
  path: string;
  type: SkillDocsFindingType;
}
