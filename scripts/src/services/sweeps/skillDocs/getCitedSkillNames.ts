const CODE_NAME_REGEX = /`(?<name>[\w-]+)`/gu;
const BOLD_NAME_REGEX = /\*\*(?<name>[\w-]+)\*\*/gu;
// The skills other than `skill` a line names, in code or in bold — a line naming another skill cites that skill's
// Pages, so a `references/…` on it is read against them as well as against its own
export const getCitedSkillNames = (line: string, skill: string, skillNames: Set<string>): string[] =>
  [...line.matchAll(CODE_NAME_REGEX), ...line.matchAll(BOLD_NAME_REGEX)]
    .map(({ groups }) => groups?.name ?? "")
    .filter((name) => name !== skill && skillNames.has(name));
