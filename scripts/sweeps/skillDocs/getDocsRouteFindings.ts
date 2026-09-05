import type { SkillDocsFile } from "#scripts/sweeps/skillDocs/models/SkillDocsFile";
import type { SkillDocsFinding } from "#scripts/sweeps/skillDocs/models/SkillDocsFinding";

import { getSkillName } from "#scripts/sweeps/skillDocs/getSkillName";
import { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";

const DOCS_ROUTE_REGEX = /`\/docs\//u;
// The two that teach the route and url forms, and so are the two that may write one
const ROUTE_OWNER_SKILLS = new Set(["docs", "readme-standards"]);

export const getDocsRouteFindings = (files: SkillDocsFile[]): SkillDocsFinding[] =>
  files
    .filter(({ path }) => !ROUTE_OWNER_SKILLS.has(getSkillName(path)))
    .flatMap(({ path, text }) =>
      text
        .split("\n")
        .map((line, index) => ({ index, line }))
        .filter(({ line }) => DOCS_ROUTE_REGEX.test(line))
        .map(({ index }) => ({
          detail: `line ${(index + 1).toString()}`,
          path,
          type: SkillDocsFindingType.DocsRoute,
        })),
    );
