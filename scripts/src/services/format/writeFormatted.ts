import { spawnFormatter } from "#src/services/format/spawnFormatter";
import { checkIsTimedOut } from "#src/services/shared/checkIsTimedOut";
import { CHILD_PROCESS_TIMEOUT_MS } from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { timedOutError } from "#src/services/shared/timedOutError";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// Rewrites each given file in place as the formatter writes it, in one formatter run over all of them. The files are
// Ones `listDifferent` has just named, so a run that does not finish is a failure to write, and it throws naming the
// Command
export const writeFormatted = (repositoryPaths: string[], repositoryRoot: string, mainCheckoutRoot: string): void => {
  const { error, status, stderr } = spawnFormatter(["--write", ...repositoryPaths], repositoryRoot, mainCheckoutRoot);
  if (checkIsTimedOut(error))
    throw timedOutError(
      Operation.Update,
      takeOne(repositoryPaths, 0),
      CHILD_PROCESS_TIMEOUT_MS,
      `oxfmt --write over ${repositoryPaths.length} files`,
    );
  if (status !== 0)
    throw new InvalidOperationError(Operation.Update, takeOne(repositoryPaths, 0), readFirstLine(stderr));
};
