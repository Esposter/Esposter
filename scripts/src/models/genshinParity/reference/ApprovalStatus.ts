// How a screen's compare stands against its bar, printed beside the image `approve` writes: a score under the bar is within
// It, and a missing reference, a failed compare or a reference judging less than the whole screen has no score to set against it
export enum ApprovalStatus {
  CompareFailed = "compare failed",
  NoReference = "no reference",
  NotWholeScreen = "not the whole screen",
  OverBar = "over the bar",
  WithinBar = "within the bar",
}
