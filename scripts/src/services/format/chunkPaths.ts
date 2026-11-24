import { OXFMT_ARGUMENTS_MAX_LENGTH } from "#src/services/shared/constants";

// The paths in runs whose arguments fit one formatter command line, each run in the order given. A path counts its
// Length plus the space after it, and a path past the bound is a run of its own, since a path cannot be split
export const chunkPaths = (paths: string[], maxLength: number = OXFMT_ARGUMENTS_MAX_LENGTH): string[][] => {
  const chunks: string[][] = [];
  let chunk: string[] = [];
  let chunkLength = 0;
  for (const path of paths) {
    const pathLength = path.length + 1;
    if (chunk.length > 0 && chunkLength + pathLength > maxLength) {
      chunks.push(chunk);
      chunk = [];
      chunkLength = 0;
    }
    chunk.push(path);
    chunkLength += pathLength;
  }
  if (chunk.length > 0) chunks.push(chunk);
  return chunks;
};
