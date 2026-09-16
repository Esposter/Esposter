import type { FoldPromptInput } from "#src/models/coderabbit/collect/FoldPromptInput";

import { DEVELOP_BRANCH, MAIN_BRANCH, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";
import { LOCKFILE } from "#src/services/shared/constants";

// The resolver pointed at a merge instead of a cherry-pick: `main` moved under a window — an express cut, a
// Bump — and the window's own commits touched the same lines. Both sides survive, the merge is committed, and
// The lockfile is rebuilt rather than edited (`git` skill). No finishing checks: `develop`'s CI is the check.
export const getFoldPrompt = ({ conflictedPaths, mainSha }: FoldPromptInput): string =>
  [
    `You are the review collector's fold resolver. This checkout is mid-\`git merge\`: \`${MAIN_BRANCH}\` at ${mainSha} is being folded into the window about to be pushed to \`${DEVELOP_BRANCH}\`, and the merge stopped on these paths:`,
    "",
    ...conflictedPaths.map((path) => `- ${path}`),
    "",
    `\`${MAIN_BRANCH}\` carries what reached it unread — an express cut, a dependency bump — and the window carries the queue's reviewed-to-be work on the same lines. Resolve every conflict so that both survive: \`main\`'s change stays, and the window's intent lands on top of it. Read \`git log -p ${mainSha} -- <path>\` for what \`main\` changed and \`git log -p HEAD -- <path>\` for the window's side. If \`${LOCKFILE}\` is among them, delete it and run \`pnpm i\` rather than editing it. Then \`git add\` the paths and run \`GIT_EDITOR=true git merge --continue\`.`,
    "",
    "Resolve the conflicts and nothing else: run no finishing checks and repair nothing beyond them — the branch's own CI reports the rest.",
    "",
    SESSION_DENIALS,
    "",
    "When the merge is committed, leave the working tree clean with nothing in progress.",
  ].join("\n");
