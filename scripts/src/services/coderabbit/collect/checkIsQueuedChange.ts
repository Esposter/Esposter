import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runGit } from "#src/services/shared/runGit";

// Whether the queue's head changes every file a red names against `main`'s head — edits it or deletes it — so a window
// Still queued carries what heals it. Only a file on the head is judged: the runner files a job's own exit-code
// Annotation under `.github`, which names nothing a commit changes, and a red naming no file is no evidence of a gap.
// The paths are matched literally, so a route file's brackets are never read as a glob, and read back with `-z`, so a
// Name git would quote reads back exactly
export const checkIsQueuedChange = (paths: string[], mainSha: string, cwd: string): boolean => {
  const queueSha = readSha(`origin/${QUEUE_BRANCH}`, cwd);
  if (queueSha === undefined || paths.length === 0) return false;

  const readPaths = (args: string[]): Set<string> =>
    new Set(
      runGit(["--literal-pathspecs", ...args, "--", ...paths], cwd)
        .split("\0")
        .filter(Boolean),
    );
  const headPaths = readPaths(["ls-tree", "-r", "--name-only", "-z", mainSha]);
  const changedPaths = readPaths(["diff", "--no-renames", "--name-only", "-z", mainSha, queueSha]);
  const filePaths = paths.filter((path) => headPaths.has(path));
  return filePaths.length > 0 && filePaths.every((path) => changedPaths.has(path));
};
