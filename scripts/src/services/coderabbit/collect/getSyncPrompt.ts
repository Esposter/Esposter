import type { SyncPromptInput } from "#src/models/coderabbit/collect/SyncPromptInput";

import { SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";
import { LOCKFILE } from "#src/services/shared/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";

// The resolver is the drain's session pointed at a conflict instead of a finding: the same checkout, the same
// Denials (no push, no branch switch, no GitHub), and the sequencer it must run to the end. The judgment it is
// Asked for is the review-queue skill's — both sides survive, and a commit whose whole change the target already
// Carries lands as an empty copy rather than a `--skip`, because that copy names its original and a skip leaves
// Nothing behind: `checkIsCarried` reads a skipped commit as owed and fails the run, and no test over content
// Could tell that drop from an abandoned sequence's. It owes no finishing checks: what proves a resolution is a
// Sequence run to its end over a clean tree that carries every commit the branch owed (`replayOwed`), a repair
// To any other commit is its owner's and the branch's own CI names it, and every minute the session spends is a
// Minute the working session can push into and cost the rewrite its lease.
export const getSyncPrompt = ({ branch, conflictedPaths, conflictSha, targetBranch }: SyncPromptInput): string =>
  [
    `You are the review collector's sync step. This checkout is mid-\`git cherry-pick\`: the commits \`${branch}\` still owes \`${targetBranch}\` are being replayed onto its tree in order, and the sequence stopped on ${conflictSha} at these paths:`,
    "",
    ...conflictedPaths.map((path) => `- ${path}`),
    "",
    `\`${targetBranch}\` carries the work already ported ahead of it; the stopped commit is \`${branch}\`'s later work on the same lines. Resolve every conflict so that both survive: the upstream change stays, and this commit's intent lands on top of it. Read \`git show ${conflictSha}\` for the intent and \`git log -p ${targetBranch} -- <path>\` for what the upstream change was made for. Resolve \`${WORKSPACE_FILE}\` first if it is among them — every \`pnpm\` in this checkout fails to parse it while its markers are there — and rebuild \`${LOCKFILE}\` with \`pnpm i\` rather than editing it. Then \`git add\` the paths and run \`GIT_EDITOR=true git cherry-pick --continue\`; repeat for every further commit the sequence stops on until it completes. When \`--continue\` refuses because the resolution came out empty — \`${targetBranch}\` already carries the stopped commit's whole change, as a repaired copy of it rather than a namesake — commit it empty with \`GIT_EDITOR=true git commit --allow-empty\` — the message git has prepared names the original, which is the only record that the change landed rather than was dropped — and resume as you would from any other stop, taking \`no cherry-pick or revert in progress\` to mean that commit was the last one. Never \`--skip\`, \`--abort\` or \`--quit\`.`,
    "",
    "Resolve the conflicts and nothing else: run no finishing checks and repair nothing in any other commit, however red the tree reads — the branch's own CI reports that to whoever owns the commit, and this checkout is a replay of every commit the branch owes, not a change of yours.",
    "",
    SESSION_DENIALS,
    "",
    "When the sequence has completed, leave the working tree clean with no cherry-pick in progress.",
  ].join("\n");
