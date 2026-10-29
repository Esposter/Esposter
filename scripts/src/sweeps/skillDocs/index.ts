import { SkillDocsFindingTypes } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { readSkillDocsFindings } from "#src/services/sweeps/skillDocs/readSkillDocsFindings";
import { timeCommand } from "#src/services/timing/timeCommand";

timeCommand("ai:sweep:skill-docs");

const typeWidth = Math.max(...SkillDocsFindingTypes.map(({ length }) => length));

for (const { detail, path, type } of readSkillDocsFindings())
  console.info(`${type.padEnd(typeWidth)} ${path}: ${detail}`);
