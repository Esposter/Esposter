import { getRestatedGameColours } from "#src/services/sweeps/restatedGameColours/getRestatedGameColours";
import { readGenshinStyleBlocks } from "#src/services/sweeps/hoverGuard/readGenshinStyleBlocks";
import { GAME_CREAM, GAME_WHITE } from "genshin-interface";

// One `path:line: NAME` per public game colour a Genshin `.vue` style block writes as its literal. A plain `.css` sheet
// Cannot read a constant, so it keeps the literal its component restates
export const readRestatedGameColourFindings = (): string[] =>
  readGenshinStyleBlocks()
    .filter(({ path }) => path.endsWith(".vue"))
    .flatMap(({ css, firstLine, path }) =>
      getRestatedGameColours(css, { GAME_CREAM, GAME_WHITE }, firstLine).map((finding) => `${path}:${finding}`),
    );
