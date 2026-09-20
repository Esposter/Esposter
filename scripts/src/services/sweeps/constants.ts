import { AGENT_DIRECTORY } from "@esposter/configuration";

// Where every ledger lives, relative to the repository root: the coverage sweep rewrites them, the prose scan
// Sets them aside as template-shaped, and the workspace suites hold their rows and scopes to the tree.
export const LEDGER_DIRECTORY = `${AGENT_DIRECTORY}/ledgers`;

// Where every skill lives, relative to the repository root: one folder per skill holding its `SKILL.md` and its
// `references/`, which is what the skill-docs checks, the prose scans and the derived skills ledger all walk.
export const SKILLS_DIRECTORY = `${AGENT_DIRECTORY}/skills`;
