import { SkillDocsFindingTypes } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { readSkillDocsFindings } from "#src/services/sweeps/skillDocs/readSkillDocsFindings";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

const typeWidth = Math.max(...SkillDocsFindingTypes.map(({ length }) => length));

await runCommand(
  defineCommand({
    meta: {
      description: "Print every skill docs finding, one per line, with its type, path and detail",
      name: "ai:sweep:skill-docs",
    },
    run: () => {
      for (const { detail, path, type } of readSkillDocsFindings())
        console.info(`${type.padEnd(typeWidth)} ${path}: ${detail}`);
    },
  }),
);
