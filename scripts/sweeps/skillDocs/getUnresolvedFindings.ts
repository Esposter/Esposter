import type { SkillDocsFile } from "#scripts/sweeps/skillDocs/models/SkillDocsFile";
import type { SkillDocsFinding } from "#scripts/sweeps/skillDocs/models/SkillDocsFinding";

import { getSkillName } from "#scripts/sweeps/skillDocs/getSkillName";
import { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";

const CITATION_REGEX = /`references\/(?<target>[\w.-]+\.md)`/gu;
const CODE_NAME_REGEX = /`(?<name>[\w-]+)`/gu;
const BOLD_NAME_REGEX = /\*\*(?<name>[\w-]+)\*\*/gu;

// A `references/…` pointer nothing resolves, which no build fails on. The line naming **another** skill is the
// Exception and not a hedge: a cross-skill pointer cites that skill's page, so resolving it against this one
// Would report every one of them — and a check that always reports gates nothing.
export const getUnresolvedFindings = (files: SkillDocsFile[], paths: Set<string>): SkillDocsFinding[] => {
  const skillNames = new Set(files.map(({ path }) => getSkillName(path)));
  return files.flatMap(({ path, text }) => {
    const skill = getSkillName(path);
    return text.split("\n").flatMap((line) => {
      const cited = [...line.matchAll(CODE_NAME_REGEX), ...line.matchAll(BOLD_NAME_REGEX)].map(
        ({ groups }) => groups?.name,
      );
      if (cited.some((name) => name !== undefined && name !== skill && skillNames.has(name))) return [];
      return [...new Set([...line.matchAll(CITATION_REGEX)].map((match) => match.groups?.target ?? ""))]
        .filter((target) => !paths.has(`.agents/skills/${skill}/references/${target}`))
        .map((target) => ({ detail: `-> ${target}`, path, type: SkillDocsFindingType.Unresolved }));
    });
  });
};
