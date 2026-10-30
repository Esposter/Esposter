import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { formatFiles } from "#src/services/format/formatFiles";
import { resolveRepositoryPath } from "#src/services/format/resolveRepositoryPath";
import { readChangedFiles } from "#src/services/queue/readChangedFiles";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";

// Formats each given file in place, or each file changed against the queue when none is given, and returns how many it
// Rewrote
export const formatPaths = (paths: string[]): number => {
  const repositoryPaths =
    paths.length === 0
      ? readChangedFiles()
          .filter(({ status }) => status !== ChangeStatus.Deleted)
          .map(({ path }) => path)
      : paths.map((path) => resolveRepositoryPath(path, process.env.INIT_CWD ?? process.cwd()));
  return formatFiles(repositoryPaths, REPOSITORY_ROOT, readMainCheckoutRoot());
};
