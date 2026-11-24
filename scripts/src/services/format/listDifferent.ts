import { spawnFormatter } from "#src/services/format/spawnFormatter";
import { Operation, takeOne } from "@esposter/shared";
import { resolve } from "node:path";

// The paths of one formatter run that the formatter would rewrite, in the order given, from `oxfmt --list-different`,
// Which prints each one on a line of its own. A path it ignores, or has no parser for, is neither listed nor an error,
// Since `--no-error-on-unmatched-pattern` makes a run of nothing but such paths a clean one. A run the formatter cannot
// Finish, since one of its files does not parse or is not UTF-8, answers undefined, and the caller checks that run file
// By file
export const listDifferent = (
  paths: string[],
  repositoryRoot: string,
  mainCheckoutRoot: string,
): string[] | undefined => {
  const { status, stdout } = spawnFormatter(
    ["--no-error-on-unmatched-pattern", "--list-different", ...paths],
    repositoryRoot,
    mainCheckoutRoot,
    {
      command: `oxfmt --list-different over ${paths.length} files`,
      name: takeOne(paths, 0),
      operation: Operation.Read,
    },
  );
  // Status 0 finds none to rewrite and status 1 names them, and any other status is a run the formatter did not finish
  if (status !== 0 && status !== 1) return undefined;
  const listed = new Set(stdout.split(/\r?\n/u).map((line) => resolve(repositoryRoot, line)));
  return paths.filter((path) => listed.has(resolve(repositoryRoot, path)));
};
