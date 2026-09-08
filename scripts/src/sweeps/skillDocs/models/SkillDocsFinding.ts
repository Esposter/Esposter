import type { SkillDocsFindingType } from "#src/sweeps/skillDocs/models/SkillDocsFindingType";

export interface SkillDocsFinding {
  detail: string;
  path: string;
  type: SkillDocsFindingType;
}
