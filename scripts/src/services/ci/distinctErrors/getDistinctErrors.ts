import type { DistinctError } from "#src/models/ci/distinctErrors/DistinctError";

const ERROR_LINE_REGEX = /error TS|error:|FAIL|×/u;
const JOB_AND_STEP_COLUMNS_REGEX = /^[^\t]*\t[^\t]*\t/u;
const SHOWN_ERROR_COUNT = 30;
const ERROR_WIDTH = 260;

// The error lines of a failed run's log with the job and step columns stripped, counted, the most frequent first.
// Each one repeated per package is one error, which is why the count is of the message, not of the line
export const getDistinctErrors = (log: string): DistinctError[] => {
  const counts = new Map<string, number>();
  for (const line of log.split("\n")) {
    const message = line.replace(JOB_AND_STEP_COLUMNS_REGEX, "");
    if (!ERROR_LINE_REGEX.test(message)) continue;

    const error = message.slice(0, ERROR_WIDTH);
    counts.set(error, (counts.get(error) ?? 0) + 1);
  }
  return Array.from(counts, ([error, count]) => ({ count, error }))
    .toSorted((firstError, secondError) => secondError.count - firstError.count)
    .slice(0, SHOWN_ERROR_COUNT);
};
