import { GAME_DATA_LOCK_REPOSITORY_PATH } from "#src/services/gameData/constants";
import { runGit } from "#src/services/shared/runGit";

export const getCommitsOf = (args: string[]): string[] =>
  runGit(["log", ...args, "--format=%H", "--", GAME_DATA_LOCK_REPOSITORY_PATH])
    .split("\n")
    .filter(Boolean);
