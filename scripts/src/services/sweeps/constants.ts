import { AGENT_DIRECTORY } from "@esposter/configuration";

// Where every ledger lives, relative to the repository root: the coverage sweep rewrites them, the prose scan
// Sets them aside as template-shaped, and the workspace suites hold their rows and scopes to the tree.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const LEDGER_DIRECTORY: string = `${AGENT_DIRECTORY}/ledgers`;
// Where every skill lives, relative to the repository root: one folder per skill holding its `SKILL.md` and its
// `references/`, which is what the skill-docs checks, the prose scans and the derived skills ledger all walk.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const SKILLS_DIRECTORY: string = `${AGENT_DIRECTORY}/skills`;

// The skills installer's record of the third-party skills it copied into the skills directory, by name. Those skills
// Are vendored, not ours: their shape is their publisher's, so no scan holds them to this repository's conventions.
export const SKILLS_LOCK_FILE = "skills-lock.json";
