import type { VerdictPromptInput } from "#src/models/coderabbit/collect/VerdictPromptInput";

import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import { MERGEABLE_RISK_LEVEL, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";

// One question, answered in one line: the bot's risk level is its impression across every round of a long pull
// Request, and it does not reset when the concerns behind it are answered — so the session reads the rationale
// Against the tree and against the record of what each finding got, and says whether anything real is left.
export const getVerdictPrompt = ({
  answers,
  developSha,
  feedback,
  level,
  riskBlock,
  verdictPath,
}: VerdictPromptInput): string =>
  [
    `You are the review collector's release verdict for this repository. This checkout is \`develop\` at ${developSha}, the head of the release pull request. The newest CodeRabbit review of that head left nothing open — every inline finding is fixed or rejected with evidence — yet the bot rates the merge risk _${level}_, above _${MERGEABLE_RISK_LEVEL}_, the one level the collector merges on unasked. ${SESSION_DENIALS} Read only; run no checks and commit nothing.`,
    "",
    'Decide one thing: does the risk rationale below name a concern that is real in this tree and that no fix or rejection on the pull request answered? Verify against the code, never from the prose alone; a concern already fixed, or rejected with evidence you cannot refute, is answered. A decision the code\'s own comment, a docs page or a skill states with its reason stands (`.agents/skills/code-review/SKILL.md`, "The written record wins").',
    "",
    `Write exactly one line to \`${verdictPath}\`: \`${ReleaseVerdict.Merge}\` followed by one sentence of why nothing real is left, or \`${ReleaseVerdict.Hold}\` followed by the one concern that is real and where it lives. Nothing else goes in the file.`,
    "",
    "## The bot's merge-risk block",
    "",
    riskBlock,
    "",
    "## What answered the findings on this pull request",
    "",
    ...(answers.length > 0 ? answers : ["none"]),
    "",
    "## The `ai:coderabbit:feedback` report",
    "",
    feedback,
  ].join("\n");
