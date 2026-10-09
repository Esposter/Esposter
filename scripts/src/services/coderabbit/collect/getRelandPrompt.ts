import type { RelandPromptInput } from "#src/models/coderabbit/collect/RelandPromptInput";

import { QUEUE_BRANCH, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";
import { LOCKFILE } from "#src/services/shared/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";

// The resolver pointed at a held commit coming back: the sync's session, with its denials, handed a pick rather than a
// Sequence. It commits nothing, since the collector commits the resolution under a message of its own
// (`getRelandMessage`), and what proves the resolution is the tree it left (`relandHeldCommit`).
export const getRelandPrompt = ({ branch, conflictedPaths, sha }: RelandPromptInput): string =>
  [
    `You are the review collector's re-land step. ${sha}, a commit the collector parked on \`${branch}\`, is being picked back onto the head of \`${QUEUE_BRANCH}\` with \`git cherry-pick --no-commit\`, and the pick stopped at these paths:`,
    "",
    ...conflictedPaths.map((path) => `- ${path}`),
    "",
    `\`${QUEUE_BRANCH}\` carries the work that landed while the commit was held; the commit is earlier work on the same lines. Resolve every conflict so that both survive: what the queue carries stays, and the commit's intent lands on top of it. Read \`git show ${sha}\` for the intent and \`git log -p HEAD -- <path>\` for what the queue's change was made for. Resolve \`${WORKSPACE_FILE}\` first if it is among them — every \`pnpm\` in this checkout fails to parse it while its markers are there — and rebuild \`${LOCKFILE}\` with \`pnpm i\` rather than editing it. Then \`git add\` every path. Commit nothing: the collector commits the resolution itself. A resolution that leaves nothing staged says the queue already carries the commit's whole change.`,
    "",
    "Resolve the conflicts and nothing else: run no finishing checks and repair nothing else, however red the tree reads — the queue's own CI reports that to whoever owns the commit.",
    "",
    SESSION_DENIALS,
    "",
    "When you are done, leave nothing unmerged and nothing untracked, with the resolution staged.",
  ].join("\n");
