import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// Windrise's paving: the two slab meshes the export places round the statue's dais, drawn as generated stones
export const pavingTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The witness layout's placements of Area_Common_Build_Ruin_H_06_Vo and _07_Vo, and the two meshes' OBJ exports read vertex by vertex in three's axes",
      outcome: InvestigationOutcome.Found,
      result:
        "Eighteen placements, eleven of H_06 and seven of H_07, of which about ten stand within seventy metres of the statue at the dais's foot and the other eight 80 to 280 metres off, all drawn as the export places them. Each mesh is a nearly square slab about 0.93 metres across and 0.11 metres thick before its scale of 1.55 to 1.81",
    },
    {
      method:
        "Each mesh's outline as its convex hull's radius at twenty-four angles about its origin, its top and bottom the highest and lowest vertices, fitted by `fitPavingStoneShape` and written to `windrise/paving.json` with every placement",
      outcome: InvestigationOutcome.Found,
      result:
        "The hull's radii run 0.42 to 0.49 metres for H_06 and 0.31 to 0.53 for H_07 before scale; the stones are drawn as a prism over that outline with flat faces, so their top, sides and depth are ours. Their placements are the witness's own, so the arrangement is exact",
    },
    {
      method:
        "genshin:parity passes windrise --pass Shape at the statue reference's camera, the stones drawn only as the Paving family, against the exports' paving drawn alone",
      outcome: InvestigationOutcome.Found,
      result:
        "The Paving outline falls from 8.52 pixels to 3.63 against a gate of one, its depth reads 0.0008 against 0.01 and its normal 6.8 degrees against 10, where before neither depth nor normal overlapped. The depth and normal are held. The outline's remainder is one stone (H_07 at 53.4, -2.2) whose top lies 5 centimetres under our terrain, and the terrain at the statue's foot is the Ground pass's height, not the stones'",
    },
  ],
  openQuestions: [
    "The outline gate of one pixel is not reached while the terrain sits 5 to 12 centimetres off the export's ground at the dais's foot, which buries H_07 at 53.4, -2.2 under ours; the Ground pass's height fit closes it, and the stone is not raised to the frame",
  ],
};
