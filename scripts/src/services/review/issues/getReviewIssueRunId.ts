const RUN_LINE_REGEX = /^Run: (?<runId>\d+)$/mu;

// The workflow run that opened or last rewrote an issue, from its `Run:` line. Empty when the body has none, as an issue
// A person opened has none.
export const getReviewIssueRunId = (body: string): string => RUN_LINE_REGEX.exec(body)?.groups?.runId ?? "";
