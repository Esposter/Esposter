import type { StatueStack } from "genshin-engine";

import { roundRotation } from "#src/services/genshinAssets/fit/roundRotation";
import { roundStatue } from "#src/services/genshinAssets/fit/roundStatue";

// A stack as the data file keeps it: its places, heights and radii to the millimetre, its turn to the ten-thousandth
export const roundStack = ({ position, rotation, sections }: StatueStack): StatueStack => ({
  position: position.map((value) => roundStatue(value)),
  rotation: rotation.map((value) => roundRotation(value)),
  sections: sections.map(({ centre, colors, height, radii }) => ({
    centre: centre.map((value) => roundStatue(value)),
    colors,
    height: roundStatue(height),
    radii: radii.map((value) => roundStatue(value)),
  })),
});
