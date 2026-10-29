import { GAME_DATA_LOCK_REPOSITORY_PATH } from "#src/services/gameData/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// A missing lock and a revision git cannot read both fail `cat-file`, so the commit is proved first: a revision that
// Names no commit throws, since reading it as no lock would let a prune take what its lock names
export const checkHasLockAt = (revision: string): boolean =>
  getResult(() => runGit(["cat-file", "-e", `${revision}:${GAME_DATA_LOCK_REPOSITORY_PATH}`])).match(
    () => true,
    () => {
      runGit(["cat-file", "-e", `${revision}^{commit}`]);
      return false;
    },
  );
