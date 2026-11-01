import { readGenshinStyleBlocks } from "#src/services/sweeps/hoverGuard/readGenshinStyleBlocks";

// One `path:finding` per finding of each Genshin stylesheet, the finding read by the rule getter it is given
export const readStyleFindings = (getFindings: (css: string, firstLine: number) => string[]): string[] =>
  readGenshinStyleBlocks().flatMap(({ css, firstLine, path }) =>
    getFindings(css, firstLine).map((finding) => `${path}:${finding}`),
  );
