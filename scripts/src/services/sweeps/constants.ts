import { AGENT_DIRECTORY } from "@esposter/configuration";

// Where every ledger lives, relative to the repository root: the coverage sweep rewrites them, the prose scan
// Sets them aside as template-shaped, and the workspace suites hold their rows and scopes to the tree.
export const LEDGER_DIRECTORY: string = `${AGENT_DIRECTORY}/ledgers`;
