// `.agents/skills/<name>/SKILL.md` and `.agents/skills/<name>/references/<page>.md` both answer `<name>`
export const getSkillName = (path: string): string => path.split("/")[2] ?? "";
