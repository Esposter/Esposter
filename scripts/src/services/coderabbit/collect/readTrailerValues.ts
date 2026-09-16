import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// One commit's values for one trailer key
export const readTrailerValues = (sha: string, key: string, cwd?: string): string[] =>
  getTrailerValues(runGit(["log", "-1", "--format=%B", sha], cwd), key);
