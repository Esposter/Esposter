import type { TriageIssue } from "#src/models/triage/TriageIssue";

import { TriageLabel } from "#src/models/triage/TriageLabel";
import { HIGH_STAKES_CONFIDENCE } from "#src/services/jev/constants";
import { readAnswers } from "#src/services/jev/readAnswers";
import { TriageLabelCriteriaMap } from "#src/services/triage/constants";
import { choice } from "@typesafe-ai/sdk";

// Which of the tracker's five roles an issue is in, read off what the issue says. A label is written to someone
// else's issue, so it sits at the high-stakes bar — and what falls short of it is not a failure but the answer
// `needs-triage` already means: a maintainer weighs this one. The same label is what a tier that answered
// nothing leaves behind, so an unconfigured checkout and an unsure reading agree.
export const readTriageLabel = async ({ body, title }: Pick<TriageIssue, "body" | "title">): Promise<TriageLabel> => {
  const answers = await readAnswers(
    { body, title },
    { label: choice("Which triage role is this issue in?", TriageLabelCriteriaMap) },
  );
  if (answers === undefined) return TriageLabel.NeedsTriage;

  const { choice: label, confidence } = answers.label;
  console.info(`jev reads ${title} as ${label} (${confidence.toFixed(2)})`);
  return confidence >= HIGH_STAKES_CONFIDENCE ? label : TriageLabel.NeedsTriage;
};
