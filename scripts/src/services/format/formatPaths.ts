import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { readFormattedSource } from "#src/services/format/readFormattedSource";
import { resolveRepositoryPath } from "#src/services/format/resolveRepositoryPath";
import { readChangedFiles } from "#src/services/queue/readChangedFiles";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Formats each given file in place, or each file changed against the queue when none is given, and returns how many it
// Rewrote. A file that is already as the formatter writes it is left alone, so its mtime does not move
export const formatPaths = (paths: string[]): number => {
  const mainCheckoutRoot = readMainCheckoutRoot();
  const repositoryPaths =
    paths.length === 0
      ? readChangedFiles()
          .filter(({ status }) => status !== ChangeStatus.Deleted)
          .map(({ path }) => path)
      : paths.map((path) => resolveRepositoryPath(path, process.env.INIT_CWD ?? process.cwd()));
  let rewrittenCount = 0;
  for (const repositoryPath of repositoryPaths) {
    const source = readFormattedSource(repositoryPath, mainCheckoutRoot);
    if (source !== undefined && source.formatted !== source.original) {
      writeFileSync(join(REPOSITORY_ROOT, repositoryPath), source.formatted);
      rewrittenCount += 1;
    }
  }
  return rewrittenCount;
};
