import type { SubCommandsDef } from "citty";

import { samplePolar } from "#src/services/genshinParity/samplePolar";
import { defineCommand } from "citty";

export const polarCommand: SubCommandsDef[string] = defineCommand({
  args: {
    image: { description: "A ring mark's field, centred in its square", required: true, type: "positional" },
    bands: { description: "Bands from the ink's inner edge to its outer", required: true, type: "positional" },
    angles: { description: "Cells round each band, clockwise from the top", required: true, type: "positional" },
  },
  meta: { description: "A ring mark's colours about the image's centre, by radius and angle", name: "polar" },
  run: ({ args }) => samplePolar(args.image, Number(args.bands), Number(args.angles)),
});
