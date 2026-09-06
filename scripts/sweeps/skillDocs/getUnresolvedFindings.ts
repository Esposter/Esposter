import type { SkillDocsFile } from "#scripts/sweeps/skillDocs/models/SkillDocsFile";
import type { SkillDocsFinding } from "#scripts/sweeps/skillDocs/models/SkillDocsFinding";

import { getSkillName } from "#scripts/sweeps/skillDocs/getSkillName";
import { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";

const CITATION_REGEX = /`references\/(?<target>[\w.-]+\.md)`/gu;
const CODE_NAME_REGEX = /`(?<name>[\w-]+)`/gu;
const BOLD_NAME_REGEX = /\*\*(?<name>[\w-]+)\*\*/gu;

// A `references/…` pointer nothing resolves, which no build fails on. A line naming **another** skill cites that
// Skill's page rather than this one's, so the citation is resolved against every skill the line names as well as
// Against the owning one. Suppressing such a line outright is what a cross-skill pointer that dangles hides behind.
export const getUnresolvedFindings = (files: SkillDocsFile[], paths: Set<string>): SkillDocsFinding[] => {
  const skillNames = new Set(files.map(({ path }) => getSkillName(path)));
  return files.flatMap(({ path, text }) => {
    const skill = getSkillName(path);
    return text.split("\n").flatMap((line) => {
      const cited = [...line.matchAll(CODE_NAME_REGEX), ...line.matchAll(BOLD_NAME_REGEX)].map(
        ({ groups }) => groups?.name ?? "",
      );
      const owners = [skill, ...cited.filter((name) => name !== skill && skillNames.has(name))];
      return [...new Set([...line.matchAll(CITATION_REGEX)].map((match) => match.groups?.target ?? ""))]
        .filter((target) => !owners.some((owner) => paths.has(`.agents/skills/${owner}/references/${target}`)))
        .map((target) => ({ detail: `-> ${target}`, path, type: SkillDocsFindingType.Unresolved }));
    });
  });
};
