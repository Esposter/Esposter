// The bot's own reading of the release, and the block the release gate would rather have: a level with the
// Rationale behind it. It is written on some releases and not others, for no reason this side can read.
export const RISK_MARKER = "final_review_risk";

// What the bot writes on every release, risk block or not: the priority, the review effort and the head the
// Assessment covers. It carries no risk level, so it is what the judge reads when there is no rationale — never
// What a merge is made on.
export const ASSESSMENT_MARKER = "change_assessment";

// The walkthrough is one comment edited in place across every review, and these blocks live only in it —
// A fetch of the reviews endpoint plus the inline threads reads as complete while missing them.
export const WALKTHROUGH_MARKERS: string[] = [RISK_MARKER, ASSESSMENT_MARKER, "pre_merge_checks_walkthrough"];

export const IN_PROGRESS_MARKER = "review in progress by coderabbit.ai";
