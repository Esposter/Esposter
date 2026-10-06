import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The oak: its prefab by level of detail and the area that places it
export const oakTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The asset index for Windrise, the pinyin names, Md and unique trees, then the GameObjects and Transforms of the meshes' blocks",
      outcome: InvestigationOutcome.Found,
      result:
        "The oak is Stages_Unique_CyTree01, the one unique tree of the open world's Stages set: a prefab per level of detail, Lod1 to Lod3, each a bark and a leaf child; Lod0's meshes are in the same block with no prefab of their own. WindriseLeaf is the falling-leaf prop",
    },
    {
      method:
        "The tile's placements by radius and rarity, its HLOD and its tree layer's combined meshes for anything tall round the statue, then every area under OpenWorld/BigWorld in the 2.6 index, the area's blob and HLOD exported",
      outcome: InvestigationOutcome.Found,
      result:
        "The oak stands in Windrise's own area, Area_FQD_City (FQD for Fēng Qǐ Dì, the region's Chinese name), not the tile: its StreamGen blob places one prefab, unturned at unit scale, and the area's HLOD draws a trunk rising from that point and the crown over the statue. The oak's Lod1 prefab has its root at its origin, so the record is the oak's place. The tile's own placements, its HLOD and its tree layer hold no oak",
    },
  ],
  openQuestions: [],
};
