import { readWindowFilePaths } from "#src/services/coderabbit/collect/readWindowFilePaths";

export const readWindowFileCount = (mergeBaseSha: string, cwd?: string, headRef = "HEAD"): number =>
  readWindowFilePaths(mergeBaseSha, cwd, headRef).length;
