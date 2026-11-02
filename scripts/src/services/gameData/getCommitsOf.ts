import { GAME_DATA_LOCK_REPOSITORY_PATH } from "#src/services/gameData/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

export const getCommitsOf = (args: string[]): string[] =>
  getNonEmptyLines(runGit(["log", ...args, "--format=%H", "--", GAME_DATA_LOCK_REPOSITORY_PATH]));
