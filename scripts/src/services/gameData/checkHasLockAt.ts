import { GAME_DATA_LOCK_REPOSITORY_PATH } from "#src/services/gameData/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

export const checkHasLockAt = (revision: string): boolean =>
  getResult(() => runGit(["cat-file", "-e", `${revision}:${GAME_DATA_LOCK_REPOSITORY_PATH}`])).match(
    () => true,
    () => false,
  );
