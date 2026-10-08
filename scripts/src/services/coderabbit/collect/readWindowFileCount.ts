import { readWindowFilePaths } from "#src/services/coderabbit/collect/readWindowFilePaths";

export const readWindowFileCount = (baseSha: string, cwd?: string, headRef = "HEAD"): number =>
  readWindowFilePaths(baseSha, cwd, headRef).length;
