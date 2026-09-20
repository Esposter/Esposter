import { AGENT_DIRECTORY } from "@esposter/configuration";

// Where every ledger lives, relative to the repository root: the coverage sweep rewrites them, the prose scan
// Sets them aside as template-shaped, and the workspace suites hold their rows and scopes to the tree.
// The annotation is redundant to oxlint but mandatory to the typecheck — an interpolated value cannot be inferred
// Under --isolatedDeclarations, which the shared node config turns on for this package.
// oxlint-disable-next-line typescript/no-inferrable-types
export const LEDGER_DIRECTORY: string = `${AGENT_DIRECTORY}/ledgers`;

// Where every skill lives, relative to the repository root: one folder per skill holding its `SKILL.md` and its
// `references/`, which is what the skill-docs checks, the prose scans and the derived skills ledger all walk.
// Annotated and disabled for the same reason as `LEDGER_DIRECTORY` above.
// oxlint-disable-next-line typescript/no-inferrable-types
export const SKILLS_DIRECTORY: string = `${AGENT_DIRECTORY}/skills`;
