import { PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { TASK_CACHE_PATH } from "#src/services/worktree/create/constants";
import { copyTaskCache } from "#src/services/worktree/create/copyTaskCache";
import { listSiblingCachePaths } from "#src/services/worktree/create/listSiblingCachePaths";
import { rankCacheSources } from "#src/services/worktree/create/rankCacheSources";
import { readChangedDirectoryCount } from "#src/services/worktree/create/readChangedDirectoryCount";
import { readInstallLayout } from "#src/services/worktree/create/readInstallLayout";
import { readRecordedAt } from "#src/services/worktree/create/readRecordedAt";
import { getResult, getResultAsync } from "@esposter/shared";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// Copies the task cache of the sibling worktree that suits this one best, and returns its path.
// It returns none when no sibling shares this one's install layout.
// A recorded run replays only where its listings match.
// So a copy saves the builds whose recorded runs still match, and never a wrong one.
// The main checkout is never the source.
// Its folders hold ignored leftovers a fresh worktree lacks, which would miss every replay.
export const seedTaskCache = async (
  mainCheckoutRoot: string,
  worktreePath: string,
  buildDirectories: string[],
): Promise<string | undefined> => {
  const layout = readInstallLayout(worktreePath);
  const buildPaths = buildDirectories
    .filter((directory) => directory !== PACKAGES_DIRECTORY)
    .map((directory) => `${PACKAGES_DIRECTORY}/${directory}`);
  // Only a sibling of this layout is asked which build directories it changed, since each question is a git call
  const sameLayout = listSiblingCachePaths(mainCheckoutRoot, worktreePath).flatMap((siblingPath) =>
    getResult(() => ({
      layout: readInstallLayout(siblingPath),
      path: siblingPath,
      recordedAt: readRecordedAt(siblingPath),
    })).match(
      (sibling) => (sibling.layout === layout ? [sibling] : []),
      // A sibling removed between the listing and its reads is no candidate, rather than a failed create
      () => [],
    ),
  );
  const candidates = sameLayout.flatMap(({ path, recordedAt }) =>
    getResult(() => ({
      changedDirectories: readChangedDirectoryCount(path, worktreePath, buildPaths),
      path,
      recordedAt,
    })).match(
      (candidate) => [candidate],
      // A sibling whose reads fail is no candidate, as one removed mid-read is
      () => [],
    ),
  );

  const destinationCachePath = join(worktreePath, TASK_CACHE_PATH);
  let failure: Error | undefined;
  for (const sourcePath of rankCacheSources(candidates)) {
    mkdirSync(destinationCachePath, { recursive: true });
    /* oxlint-disable-next-line no-await-in-loop -- Order is the contract: the next sibling is copied only once the one
       ranked before it has failed */
    const copied = await getResultAsync(() => copyTaskCache(join(sourcePath, TASK_CACHE_PATH), destinationCachePath));
    const copyFailure = copied.match(
      () => undefined,
      (error) => error,
    );
    if (copyFailure === undefined) return sourcePath;
    // A copy refused or cut short is removed whole.
    // Every replay in this worktree would fail on its missing archives, so none is kept.
    rmSync(destinationCachePath, { force: true, recursive: true });
    failure = copyFailure;
  }
  if (failure !== undefined) throw failure;
  return undefined;
};
