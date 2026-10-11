import { ERROR_LINE_REGEX, MAX_ERROR_LINES_PER_JOB } from "#src/services/ci/constants";

// `gh run view --log-failed` prefixes every line with the job, the step and a timestamp, tab-separated, and a job's whole
// Log from the API with the timestamp alone
const LOG_LINE_PREFIX_REGEX = /^(?:[^\t]*\t[^\t]*\t)?\d{4}-\d{2}-\d{2}T\S+\s/u;

// The lines of a failed job's log that say what failed, without the log's prefixes, at most a bounded count. A cut is
// Said in a last line with the count left out, so a long list is never read as the whole of it
export const getErrorLines = (log: string): string[] => {
  const errorLines = log
    .split("\n")
    .map((line) => line.replace(LOG_LINE_PREFIX_REGEX, "").trimEnd())
    .filter((line) => ERROR_LINE_REGEX.test(line));
  const leftOutCount = errorLines.length - MAX_ERROR_LINES_PER_JOB;
  return leftOutCount > 0
    ? [...errorLines.slice(0, MAX_ERROR_LINES_PER_JOB), `… ${leftOutCount} more, in the job's log`]
    : errorLines;
};
