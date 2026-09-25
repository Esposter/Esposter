import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";

// `.agents/skills/<name>/SKILL.md` and `.agents/skills/<name>/references/<page>.md` both answer `<name>`, read off
// The skills directory itself rather than a segment count; a path outside it answers ""
export const getSkillName = (path: string): string =>
  path.startsWith(`${SKILLS_DIRECTORY}/`) ? (path.slice(SKILLS_DIRECTORY.length + 1).split("/")[0] ?? "") : "";
