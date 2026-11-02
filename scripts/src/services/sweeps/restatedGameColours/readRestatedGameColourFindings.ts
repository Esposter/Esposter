import { readGenshinStyleBlocks } from "#src/services/sweeps/hoverGuard/readGenshinStyleBlocks";
import { getRestatedGameColours } from "#src/services/sweeps/restatedGameColours/getRestatedGameColours";
import * as interfaceConstants from "genshin-interface/constants";

// One `path:line: NAME` per public game colour a Genshin `.vue` style block writes as its literal. The public colours are
// The interface library's constants that hold a `#rrggbb` colour, so a colour the library publishes later is held to this
// Without the scan being told. A plain `.css` sheet cannot read a constant, so it keeps the literal its component restates
export const readRestatedGameColourFindings = (): string[] => {
  const colourMap = Object.fromEntries(
    Object.entries<unknown>(interfaceConstants).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && /^#[\da-f]{6}$/iu.test(entry[1]),
    ),
  );
  return readGenshinStyleBlocks()
    .filter(({ path }) => path.endsWith(".vue"))
    .flatMap(({ css, firstLine, path }) =>
      getRestatedGameColours(css, colourMap, firstLine).map((finding) => `${path}:${finding}`),
    );
};
