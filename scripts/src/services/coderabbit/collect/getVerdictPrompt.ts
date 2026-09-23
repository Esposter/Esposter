import type { VerdictPromptInput } from "#src/models/coderabbit/collect/VerdictPromptInput";

import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import { MERGEABLE_RISK_LEVEL, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";

// One question, answered in one line: the bot's risk level is its impression across every round of a long pull
// Request, and it does not reset when the concerns behind it are answered — so the session reads the rationale
// Against the tree and against the record of what each finding got, and says whether anything real is left. A
// Head the bot stated no level for is the same question over the block it did write, since the review being
// Clean at the head is what reached here either way.
export const getVerdictPrompt = ({
  answers,
  developSha,
  feedback,
  level,
  riskBlock,
  unreviewedFromSha,
  verdictPath,
}: VerdictPromptInput): string =>
  [
    `You are the review collector's release verdict for this repository. This checkout is \`develop\` at ${developSha}, the head of the release pull request. ${
      unreviewedFromSha === undefined
        ? "The newest CodeRabbit review of that head left nothing open"
        : `CodeRabbit skipped its review of that head, and the reviews up to ${unreviewedFromSha} left nothing open`
    } — every inline finding is fixed or rejected with evidence — ${
      level === undefined
        ? "and the bot's walkthrough states no merge risk for it at all, so there is no level to merge on unasked and its assessment of the change is the whole of what it said"
        : unreviewedFromSha === undefined
          ? `yet the bot rates the merge risk _${level}_, above _${MERGEABLE_RISK_LEVEL}_, the one level the collector merges on unasked`
          : `and the bot last rated the merge risk _${level}_ over an older head, a level nothing merges on unasked`
    }. ${SESSION_DENIALS} Read only; run no checks and commit nothing.`,
    "",
    ...(unreviewedFromSha === undefined
      ? []
      : [
          `No review read the commits after ${unreviewedFromSha}: read \`git log -p ${unreviewedFromSha}..${developSha}\` against the tree as the review would have, and a real defect there is a concern nothing on the pull request answered.`,
          "",
        ]),
    "Decide one thing: does the bot's block below name a concern that is real in this tree and that no fix or rejection on the pull request answered? Verify against the code, never from the prose alone; a concern already fixed, or rejected with evidence you cannot refute, is answered. A decision the code's own comment, a docs page or a skill states with its reason stands (`.agents/skills/code-review/SKILL.md`, \"The written record wins\").",
    "",
    `Write exactly one line to \`${verdictPath}\`: \`${ReleaseVerdict.Merge}\` followed by one sentence of why nothing real is left, or \`${ReleaseVerdict.Hold}\` followed by the one concern that is real and where it lives. Nothing else goes in the file.`,
    "",
    `## The bot's ${level === undefined ? "change assessment" : "merge-risk block"}`,
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
