import type { RepairPromptInput } from "#src/models/coderabbit/collect/RepairPromptInput";

import { MAIN_BRANCH, REPAIR_VERIFY_COMMANDS, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";
import { getInstallFailureSection } from "#src/services/coderabbit/collect/getInstallFailureSection";
import { getRepairTrailer } from "#src/services/coderabbit/collect/getRepairTrailer";

// The drain's session pointed at a red `main`: the checks CI failed on the head, the repair as one commit the
// Collector verifies with every check and pushes unread, and the trailer recording which head it answered and
// Which collector made it, which is what proves the commit is the repair (`getRepairTrailer`). The suite is named
// Because CI skips every job that needs a failed one: a head whose package build is red shows no typecheck, lint or
// Test red, and a repair that passes only the failed checks fails `checkIsGreen` on errors the session was never shown.
// The deadline is named so the session budgets its own checks inside it rather than learning of it by being killed.
export const getRepairPrompt = ({
  collectorSha,
  failedLog,
  installFailure,
  mainSha,
  remainingMinutes,
  runUrl,
}: RepairPromptInput): string => {
  const trailer = getRepairTrailer(mainSha, collectorSha);
  return [
    `You are the review collector's repairer. \`${MAIN_BRANCH}\` at ${mainSha} is red: the run ${runUrl} failed on its tree, and the tail of every failing job's log follows. This checkout is detached at that head. ${SESSION_DENIALS}`,
    "",
    "Repair the tree so every check that failed passes, and so does every check the collector verifies the repair with; change nothing else. What a red asks for is its own: a lint rule asks for the substitution it names, written the way the repo's own convention has it (`.agents/skills/oxlint/SKILL.md`); a size snapshot asks for a rebuild of that package first and the narrowed `-u` run after it (`.agents/skills/testing/references/platform-and-bundle-tests.md`), never the number the failure printed typed in; a failing test asks for whichever of the code or the assertion is wrong, read from what the test proves; a code-scanning alert asks for the code at the line it names written so the query no longer matches — the rule's own remedy (a sanitizer run to a fixed point, a nested quantifier unnested), never a dismissal or a suppression comment. Run each failed check locally the way CI runs it, in the foreground, and wait for it to finish: this session is one-shot, so a check started in the background is a check whose result no turn of yours will ever read. A code-scanning alert has no local run — the scan the push fires is what proves that repair.",
    "",
    `CI skips every job that needs a failed one — a red package build skips the typecheck, lint and test jobs behind it — so the tails below may not be every red on this head. The collector verifies your commit with ${REPAIR_VERIFY_COMMANDS.map((args) => `\`pnpm ${args.join(" ")}\``).join(", ")}, in that order, and pushes nothing unless every one passes: once the failed checks pass, run each of those in the foreground and repair what it reports, in the same one commit.`,
    "",
    `This attempt has ${remainingMinutes} minutes left, and the collector's own verify of your commit runs inside them after you exit: past them the session is killed, or the verify cut short, and the attempt counts as failed. Run the failed checks first and the suite once, and commit with enough of them left for the collector to run that suite again.`,
    "",
    `Commit the repair as one commit carrying the trailer \`${trailer}\` exactly, added with \`git commit --trailer "${trailer}"\`. Once that suite passes the collector pushes it straight to \`${MAIN_BRANCH}\` unread, so the body says what each red was and what answered it — that body is the only review the repair gets.`,
    "",
    "Leave the working tree clean.",
    "",
    ...getInstallFailureSection(installFailure),
    "## The failing jobs",
    "",
    failedLog,
  ].join("\n");
};
