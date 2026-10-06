import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The valley's water and the ponds above it
export const waterTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The tile's placements named by their path hash for water, then the WaterPlane prefabs' GameObjects and Transforms in their blocks, each pond's height tested against its bed and shore in the heightfield",
      outcome: InvestigationOutcome.Found,
      result:
        "The valley's water is one surface the tile places, Area_Md_Water_Common_01_Vo, a kilometre across at the height the south pond's own plane stands at. The tile's WaterPlane prefabs hold three ponds as children of a root no stream was found placing",
    },
  ],
  openQuestions: [
    "The ponds above the valley's water: the tile's WaterPlane prefabs, whose root stands at its 512-metre cell's centre and 200 metres up by every pond's bed and shore, a place inferred rather than read",
  ],
};
