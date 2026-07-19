import { ESLint } from "eslint";

const SLOWEST_FILE_COUNT = 15;
const MILLISECONDS_DECIMAL_PLACES = 1;

const getTimes = ({ stats }: Pick<ESLint.LintResult, "stats">) => {
  let parseMilliseconds = 0;
  let rulesMilliseconds = 0;
  let totalMilliseconds = 0;

  for (const pass of stats?.times.passes ?? []) {
    parseMilliseconds += pass.parse.total;
    rulesMilliseconds += Object.values(pass.rules ?? {}).reduce((sum, { total }) => sum + total, 0);
    totalMilliseconds += pass.total;
  }

  return { parseMilliseconds, rulesMilliseconds, totalMilliseconds };
};

const eslintStatsFormatter: ESLint.FormatterFunction = async (results, context) => {
  const eslint = new ESLint();
  const stylish = await eslint.loadFormatter("stylish");
  const output = await stylish.format(results, context);
  if (!results.some(({ stats }) => stats)) return output;

  const cwd = process.cwd();
  const timedResults = results
    .map((result) => ({ filePath: result.filePath.replace(cwd, "").replaceAll("\\", "/"), ...getTimes(result) }))
    .toSorted((a, b) => b.totalMilliseconds - a.totalMilliseconds);
  // The first-parsed file absorbs the one-time TypeScript project initialization inside parseForESLint
  // It cannot be measured separately, so flag the outlier instead of letting it masquerade as a slow file
  const maxParseFilePath = timedResults.reduce((max, result) =>
    result.parseMilliseconds > max.parseMilliseconds ? result : max,
  ).filePath;
  const rows = timedResults
    .slice(0, SLOWEST_FILE_COUNT)
    .map(({ filePath, parseMilliseconds, rulesMilliseconds, totalMilliseconds }) => ({
      File: filePath === maxParseFilePath ? `${filePath} (includes one-time TS project init)` : filePath,
      "Parse (ms)": parseMilliseconds.toFixed(MILLISECONDS_DECIMAL_PLACES),
      "Rules (ms)": rulesMilliseconds.toFixed(MILLISECONDS_DECIMAL_PLACES),
      "Total (ms)": totalMilliseconds.toFixed(MILLISECONDS_DECIMAL_PLACES),
    }));
  const totalParseMilliseconds = timedResults.reduce((sum, { parseMilliseconds }) => sum + parseMilliseconds, 0);
  const totalMilliseconds = timedResults.reduce((sum, { totalMilliseconds: value }) => sum + value, 0);
  const summary = `Slowest ${Math.min(SLOWEST_FILE_COUNT, timedResults.length)} of ${timedResults.length} files (parse total: ${totalParseMilliseconds.toFixed(MILLISECONDS_DECIMAL_PLACES)}ms, lint total: ${totalMilliseconds.toFixed(MILLISECONDS_DECIMAL_PLACES)}ms)`;

  console.table(rows);
  return `${output}\n${summary}\n`;
};

export default eslintStatsFormatter;
