// Whether a screen's image is approved by its compare: approved when the compare is under the bar, and otherwise why not
export enum ApprovalOutcome {
  Approved = "approved",
  CompareFailed = "compare failed",
  NoReference = "no reference",
  OverBar = "over the bar",
  NotWholeScreen = "not the whole screen",
}
