// How a screen's compare stands against its bar, printed beside the image `approve` writes: a score under the bar is
// Within it, and a missing reference, a failed compare or a reference judging less than the whole screen has no score
// To set against it
export const ApprovalStatus = {
  CompareFailed: "compare failed",
  NoReference: "no reference",
  NotWholeScreen: "not the whole screen",
  OverBar: "over the bar",
  WithinBar: "within the bar",
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];
