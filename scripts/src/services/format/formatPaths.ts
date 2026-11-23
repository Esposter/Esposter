import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { formatFiles } from "#src/services/format/formatFiles";
import { resolveRepositoryPath } from "#src/services/format/resolveRepositoryPath";
import { readChangedFiles } from "#src/services/queue/readChangedFiles";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getInvocationDirectory } from "#src/services/shared/resolveInvocationPath";

// Formats each given file in place, or each file changed against the queue when none is given, and returns how many it
// Rewrote. A given file is formatted under the configuration of the checkout it is in, its worktree's or the main one's
export const formatPaths = (paths: string[]): number => {
  const mainCheckoutRoot = readMainCheckoutRoot();
  if (paths.length === 0)
    return formatFiles(
      readChangedFiles()
        .filter(({ status }) => status !== ChangeStatus.Deleted)
        .map(({ path }) => path),
      REPOSITORY_ROOT,
      mainCheckoutRoot,
    );
  const invocationDirectory = getInvocationDirectory();
  const files = paths.map((path) => resolveRepositoryPath(path, invocationDirectory, mainCheckoutRoot));
  return Array.from(
    Map.groupBy(files, ({ checkoutRoot }) => checkoutRoot),
    ([checkoutRoot, checkoutFiles]) =>
      formatFiles(
        checkoutFiles.map(({ repositoryPath }) => repositoryPath),
        checkoutRoot,
        mainCheckoutRoot,
      ),
  ).reduce((total, count) => total + count, 0);
};
