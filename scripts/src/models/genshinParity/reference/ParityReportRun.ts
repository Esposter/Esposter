// The run a scores report is written by: a full run visits every reference and rewrites the whole report, dropping the rows
// Of references the map no longer holds; a subset run rewrites only the rows it scored and leaves every other row as it was
export enum ParityReportRun {
  Full = "full",
  Subset = "subset",
}
