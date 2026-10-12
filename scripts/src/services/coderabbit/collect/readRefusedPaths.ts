import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readSha } from "#src/services/coderabbit/collect/readSha";

// A sequence still open with no pick in progress, over a tree that differs from HEAD: git refused the next pick over
// A path it touches. The refusal names no commit, so the paths are the only name the stop has
export const readRefusedPaths = (cwd: string): string[] =>
  checkIsSequencing(cwd) && readSha("CHERRY_PICK_HEAD", cwd) === undefined ? readDirtyPaths(cwd) : [];
