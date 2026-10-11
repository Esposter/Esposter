import { ERROR_LINE_REGEX, MAX_ERROR_LINES_PER_JOB } from "#src/services/ci/constants";

// `gh run view --log-failed` prefixes every line with the job, the step and a timestamp, tab-separated
const LOG_LINE_PREFIX_REGEX = /^[^\t]*\t[^\t]*\t\S+\s/u;

// The lines of a failed job's log that say what failed, without the log's prefixes, at most a bounded count
export const getErrorLines = (log: string): string[] =>
  log
    .split("\n")
    .map((line) => line.replace(LOG_LINE_PREFIX_REGEX, "").trimEnd())
    .filter((line) => ERROR_LINE_REGEX.test(line))
    .slice(0, MAX_ERROR_LINES_PER_JOB);
