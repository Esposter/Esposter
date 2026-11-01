import { getUnattributedPresses } from "#src/services/sweeps/hoverGuard/getUnattributedPresses";
import { readGenshinStyleBlocks } from "#src/services/sweeps/hoverGuard/readGenshinStyleBlocks";

// One `path:line: selector` per press rule of the Genshin stylesheets that names `:active` and not `[data-pressed]`
export const readUnattributedPressFindings = (): string[] =>
  readGenshinStyleBlocks().flatMap(({ css, firstLine, path }) =>
    getUnattributedPresses(css, firstLine).map((finding) => `${path}:${finding}`),
  );
