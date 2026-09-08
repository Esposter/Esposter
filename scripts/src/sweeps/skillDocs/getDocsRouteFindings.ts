import type { SkillDocsFile } from "#src/sweeps/skillDocs/models/SkillDocsFile";
import type { SkillDocsFinding } from "#src/sweeps/skillDocs/models/SkillDocsFinding";

import { getSkillName } from "#src/sweeps/skillDocs/getSkillName";
import { SkillDocsFindingType } from "#src/sweeps/skillDocs/models/SkillDocsFindingType";

const DOCS_ROUTE_REGEX = /`\/docs\//u;
// The two that teach the route and url forms, and so are the two that may write one
const RouteOwnerSkills = new Set(["docs", "readme-standards"]);

export const getDocsRouteFindings = (files: SkillDocsFile[]): SkillDocsFinding[] =>
  files
    .filter(({ path }) => !RouteOwnerSkills.has(getSkillName(path)))
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
