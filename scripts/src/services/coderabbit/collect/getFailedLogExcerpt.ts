import { FAILED_LOG_TAIL_LINES } from "#src/services/coderabbit/collect/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// `gh run view --log-failed` prints `<job>\t<step>\t<timestamp> <text>` per line, the text carrying the colours
// The check printed to a terminal
const LOG_LINE_REGEX = /^(?<job>[^\t]*)\t[^\t]*\t\S+ ?(?<text>.*)$/u;

const ANSI_ESCAPE_REGEX = /\[[\d;]*m/gu;

// The tail of every failing job's log, one section per job: a check states its verdict at the end — the failed
// Assertions, the rule and the file, the error count — after every line it printed on its way there
export const getFailedLogExcerpt = (log: string): string => {
  const jobLinesMap = new Map<string, string[]>();
  for (const line of getNonEmptyLines(log)) {
    const groups = LOG_LINE_REGEX.exec(line)?.groups;
    if (!groups) continue;

    const { job = "", text = "" } = groups;
    const lines = jobLinesMap.get(job) ?? [];
    lines.push(text.replaceAll(ANSI_ESCAPE_REGEX, ""));
    jobLinesMap.set(job, lines);
  }
  return Array.from(
    jobLinesMap,
    ([job, lines]) => `### ${job}\n\n${lines.slice(-FAILED_LOG_TAIL_LINES).join("\n")}`,
  ).join("\n\n");
};
