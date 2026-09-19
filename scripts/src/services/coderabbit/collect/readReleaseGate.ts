import type { ReleaseVerdictLine } from "#src/models/coderabbit/collect/ReleaseVerdictLine";
import type { VerdictPromptInput } from "#src/models/coderabbit/collect/VerdictPromptInput";

import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import { HIGH_STAKES_CONFIDENCE } from "#src/services/jev/constants";
import { readAnswers } from "#src/services/jev/readAnswers";
import { noul } from "@typesafe-ai/sdk";

// The question the verdict session is spawned to answer, asked first of the tier that answers from the text
// Alone. The bot's risk level is its impression across every round and does not reset when the concerns behind
// It are answered, so the common head is one where the rationale names nothing the pull request has not already
// Answered — and that reading is in the rationale, the fixes and the rejections, all of which are in hand here.
// What is not in hand is the tree, so a rationale that turns on what the code actually does lands in the band
// And the session reads it there.
export const readReleaseGate = async ({
  answers,
  feedback,
  riskBlock,
}: Pick<VerdictPromptInput, "answers" | "feedback" | "riskBlock">): Promise<ReleaseVerdictLine | undefined> => {
  const decisions = await readAnswers(
    { answers, feedback, riskBlock },
    {
      isOpen: noul(
        "Does the merge-risk rationale name a concern that no fix or rejection recorded on this pull request answered?",
        {
          false: "Every concern the rationale names was fixed, or rejected with evidence nothing here refutes.",
          true: "At least one concern it names is left standing, or turns on what the code does rather than on what the record says.",
        },
      ),
    },
  );
  if (decisions === undefined) return undefined;

  // A merge and a hold are both written to the pull request, so both sit at the high-stakes bar and the band
  // Between them is the session's. The probability goes in the reason: a person reading the verdict later can
  // See which tier decided it and how close it was.
  const openProbability = decisions.isOpen.noul;
  const stated = openProbability.toFixed(2);
  if (openProbability <= 1 - HIGH_STAKES_CONFIDENCE)
    return {
      reason: `the rationale names nothing the pull request has not answered (jev ${stated})`,
      verdict: ReleaseVerdict.Merge,
    };
  else if (openProbability >= HIGH_STAKES_CONFIDENCE)
    return {
      reason: `the rationale names a concern the pull request never answered (jev ${stated})`,
      verdict: ReleaseVerdict.Hold,
    };
  return undefined;
};
