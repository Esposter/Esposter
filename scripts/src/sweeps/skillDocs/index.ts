import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { readSkillDocsFindings } from "#src/services/sweeps/skillDocs/readSkillDocsFindings";

const typeWidth = Math.max(...Object.values(SkillDocsFindingType).map(({ length }) => length));

for (const { detail, path, type } of readSkillDocsFindings())
  console.info(`${type.padEnd(typeWidth)} ${path}: ${detail}`);
