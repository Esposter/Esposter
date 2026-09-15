import type { SyncPromptInput } from "#src/models/coderabbit/collect/SyncPromptInput";

import { QUEUE_BRANCH, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";

// The resolver is the drain's session pointed at a conflict instead of a finding: the same checkout, the same
// Denials (no push, no branch switch, no GitHub), and the sequencer it must run to the end. The judgment it is
// Asked for is the review-queue skill's — both sides survive, and a commit is skipped only once the target
// Already carries its whole change. It owes no finishing checks: what proves a resolution is the sequence run to
// Its end over a clean tree, a repair to any other queue commit is the session's and the queue's own CI names it,
// And every minute the session spends is a minute the working session can push into and cost the rewrite its lease.
export const getSyncPrompt = ({ conflictedPaths, conflictSha, targetBranch }: SyncPromptInput): string =>
  [
    `You are the review collector's sync step. This checkout is mid-\`git cherry-pick\`: the commits \`${QUEUE_BRANCH}\` still owes \`${targetBranch}\` are being replayed onto its tree in order, and the sequence stopped on ${conflictSha} at these paths:`,
    "",
    ...conflictedPaths.map((path) => `- ${path}`),
    "",
    `\`${targetBranch}\` carries the windows already reviewed and the reviewer's fixes; the stopped commit is the queue's later work on the same lines. Resolve every conflict so that both survive: the upstream change stays, and this commit's intent lands on top of it. Read \`git show ${conflictSha}\` for the intent and \`git log -p ${targetBranch} -- <path>\` for what the upstream change was made for. Then \`git add\` the paths and run \`GIT_EDITOR=true git cherry-pick --continue\`; repeat for every further commit the sequence stops on until it completes. \`git cherry-pick --skip\` is allowed only when \`${targetBranch}\` already carries the stopped commit's whole change — a repaired copy of it, not a namesake — and never \`--abort\` or \`--quit\`.`,
    "",
    "Resolve the conflicts and nothing else: run no finishing checks and repair nothing in any other commit, however red the tree reads — the queue's own CI reports that to the session that owns the commit, and this checkout is a replay of every commit the queue owes, not a change of yours.",
    "",
    SESSION_DENIALS,
    "",
    "When the sequence has completed, leave the working tree clean with no cherry-pick in progress.",
  ].join("\n");
