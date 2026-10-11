import type { SyncPromptInput } from "#src/models/coderabbit/collect/SyncPromptInput";

import { SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";
import { LOCKFILE } from "#src/services/shared/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";

// The resolver is the drain's session pointed at a conflict instead of a finding: the same checkout, the same
// Denials (no push, no branch switch, no GitHub), and one stopped commit to land — the collector hands each further
// Stop to a session of its own, so no one session's deadline has to hold a whole replay's conflicts. The judgment it
// Is asked for is the review-queue skill's — both sides survive, and a commit whose whole change the target already
// Carries lands as an empty copy rather than a `--skip`, because that copy names its original and a skip leaves
// Nothing behind: `checkIsCarried` reads a skipped commit as owed and fails the run, and no test over content
// Could tell that drop from an abandoned sequence's. It owes no finishing checks: what proves a resolution is the
// Sequence moved past the commit and carrying it (`replayOwed`), a repair to any other commit is its owner's and the
// Branch's own CI names it, and every minute the session spends is a minute the working session can push into and
// Cost the rewrite its lease.
export const getSyncPrompt = ({ branch, conflictedPaths, conflictSha, targetBranch }: SyncPromptInput): string =>
  [
    `You are the review collector's sync step. This checkout is mid-\`git cherry-pick\`: the commits \`${branch}\` still owes \`${targetBranch}\` are being replayed onto its tree in order, and the sequence stopped on ${conflictSha} at these paths:`,
    "",
    ...conflictedPaths.map((path) => `- ${path}`),
    "",
    `\`${targetBranch}\` carries the work already ported ahead of it; the stopped commit is \`${branch}\`'s later work on the same lines. Resolve every conflict so that both survive: the upstream change stays, and this commit's intent lands on top of it. Read \`git show ${conflictSha}\` for the intent and \`git log -p ${targetBranch} -- <path>\` for what the upstream change was made for. Resolve \`${WORKSPACE_FILE}\` first if it is among them — every \`pnpm\` in this checkout fails to parse it while its markers are there — and rebuild \`${LOCKFILE}\` with \`pnpm i\` rather than editing it. Then \`git add\` the paths and run \`GIT_EDITOR=true git cherry-pick --continue\` once. When it refuses because the resolution came out empty — \`${targetBranch}\` already carries the stopped commit's whole change, as a repaired copy of it rather than a namesake — commit it empty with \`GIT_EDITOR=true git commit --allow-empty\` — the message git has prepared names the original, which is the only record that the change landed rather than was dropped — and run \`GIT_EDITOR=true git cherry-pick --continue\` once more, taking \`no cherry-pick or revert in progress\` to mean that commit was the last one. ${conflictSha} is your whole task: once the sequence has moved past it — completed, or stopped on a further commit — end the session and leave any further stop exactly as git left it, since the collector hands each to a session of its own. Never \`--skip\`, \`--abort\` or \`--quit\`.`,
    "",
    "Resolve the conflicts and nothing else: run no finishing checks and repair nothing in any other commit, however red the tree reads — the branch's own CI reports that to whoever owns the commit, and this checkout is a replay of every commit the branch owes, not a change of yours.",
    "",
    SESSION_DENIALS,
    "",
    `When the sequence has moved past ${conflictSha}, stop: a completed sequence leaves the working tree clean, and a further stop is the next session's.`,
  ].join("\n");
