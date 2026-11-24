import { spawnFormatter } from "#src/services/format/spawnFormatter";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// Rewrites each given file in place as the formatter writes it, in one formatter run over all of them. The files are
// Ones `listDifferent` has just named, so a run that does not finish is a failure to write, and it throws naming the
// Command
export const writeFormatted = (repositoryPaths: string[], repositoryRoot: string, mainCheckoutRoot: string): void => {
  const { status, stderr } = spawnFormatter(["--write", ...repositoryPaths], repositoryRoot, mainCheckoutRoot, {
    command: `oxfmt --write over ${repositoryPaths.length} files`,
    name: takeOne(repositoryPaths, 0),
    operation: Operation.Update,
  });
  if (status !== 0)
    throw new InvalidOperationError(Operation.Update, takeOne(repositoryPaths, 0), readFirstLine(stderr));
};
