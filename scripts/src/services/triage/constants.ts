import { TriageLabel } from "#src/models/triage/TriageLabel";

// What each label means to the person reading the tracker, written for a reader that has the issue in front of
// It and nothing else — no repository, no history. `needs-triage` is also where an undecided issue lands, so its
// Description says what leaves it there rather than what puts it there.
export const TriageLabelCriteriaMap: Record<TriageLabel, string> = {
  [TriageLabel.NeedsInfo]:
    "Something is missing that only the reporter can supply: a repro, a version, a log, which of two things they meant.",
  [TriageLabel.NeedsTriage]:
    "A maintainer has to weigh this before anyone starts: it is a judgement about the product, a duplicate to confirm, or a report too vague to sort without knowing the codebase.",
  [TriageLabel.ReadyForAgent]:
    "Fully specified and mechanical: what to change, where, and how to tell it worked are all stated or obvious from the issue.",
  [TriageLabel.ReadyForHuman]:
    "Specified, but it needs a person: a design decision, a judgement about the product, a change nobody can verify without running it.",
  [TriageLabel.WontFix]:
    "This will not be actioned: it is out of scope, works as intended, or asks for something the project has decided against.",
};
// The table `TriageLabel` copies, and the resources that decide whether those labels exist on the tracker at
// All — both read by the test that holds the enum to them
export const TRIAGE_LABELS_PATH = ".agents/triage-labels.md";

export const GITHUB_LABELS_DIRECTORY = "apps/infra/src/github/labels";
