// The run a scores report is written by: a full run visits every reference and rewrites the whole report, dropping the rows
// Of references the map no longer holds; a subset run rewrites only the rows it scored and leaves every other row as it was
export const ParityReportRun = { Full: "full", Subset: "subset" } as const;
export type ParityReportRun = (typeof ParityReportRun)[keyof typeof ParityReportRun];
