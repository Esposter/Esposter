import type { RepairPromptInput } from "#src/models/coderabbit/collect/RepairPromptInput";

import { MAIN_BRANCH, REPAIRS_TRAILER, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";

// The drain's session pointed at a red `main`: the checks CI failed on the head, the repair as one commit the
// Collector verifies with every check and pushes unread, and the trailer that records which head it answered
export const getRepairPrompt = ({ failedLog, mainSha, runUrl }: RepairPromptInput): string =>
  [
    `You are the review collector's repairer. \`${MAIN_BRANCH}\` at ${mainSha} is red: the run ${runUrl} failed on it, and the tail of every failing job's log follows. This checkout is detached at that head. ${SESSION_DENIALS}`,
    "",
    "Repair the tree so every check that failed passes, and change nothing else. What a red asks for is its own: a lint rule asks for the substitution it names, written the way the repo's own convention has it (`.agents/skills/oxlint/SKILL.md`); a size snapshot asks for a rebuild of that package first and the narrowed `-u` run after it (`.agents/skills/testing/references/platform-and-bundle-tests.md`), never the number the failure printed typed in; a failing test asks for whichever of the code or the assertion is wrong, read from what the test proves; a code-scanning alert asks for the code at the line it names written so the query no longer matches — the rule's own remedy (a sanitizer run to a fixed point, a nested quantifier unnested), never a dismissal or a suppression comment. Run each failed check locally the way CI runs it, in the foreground, and wait for it to finish: this session is one-shot, so a check started in the background is a check whose result no turn of yours will ever read. A code-scanning alert has no local run — the scan the push fires is what proves that repair.",
    "",
    `Commit the repair as one commit carrying the trailer \`${REPAIRS_TRAILER}: ${mainSha}\`, added with \`git commit --trailer "${REPAIRS_TRAILER}: ${mainSha}"\`. The collector runs the whole check suite on it and pushes it straight to \`${MAIN_BRANCH}\` unread, so the body says what each red was and what answered it — that body is the only review the repair gets.`,
    "",
    "Leave the working tree clean.",
    "",
    "## The failing jobs",
    "",
    failedLog,
  ].join("\n");
