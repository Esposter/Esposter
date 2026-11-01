import { getUnguardedHovers } from "#src/services/sweeps/hoverGuard/getUnguardedHovers";
import { readGenshinStyleBlocks } from "#src/services/sweeps/hoverGuard/readGenshinStyleBlocks";

// One `path:line: selector` per hover rule of the Genshin stylesheets outside the hover media query
export const readUnguardedHoverFindings = (): string[] =>
  readGenshinStyleBlocks().flatMap(({ css, firstLine, path }) =>
    getUnguardedHovers(css, firstLine).map((finding) => `${path}:${finding}`),
  );
