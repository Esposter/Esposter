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
    {
      method:
        "The canopy fitted to the export's own leaves rather than a species' random clusters: k-means of the Lod1 leaf mesh's card centres into 40 clusters, each reaching the 90th percentile of its cards, 400 cards a cluster, the trunk stepped down the bark's own taper from 7.6 metres at the foot to 5.2 at 12, each judged by the Shape pass at the reference camera",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "The oak's outline falls from 63.5 to 11.7 pixels and its normal from 79.1 to 48.5 degrees, and the Ground's outline from 16.7 to 10.6 pixels with its normal held at 9.7 degrees. But the oak's depth rises from 0.189 to 0.212 and the Ground's from 0.0374 to 0.0375, so the change is not landed: a mixed result. Eighty clusters lowered the outline further, to 10.0 pixels at 400 cards a cluster and 8.8 at 200, and the depth rose further, to 0.224 and 0.243, so more clusters do not close the depth: the depth gap is not the canopy's layout, and its cause (the oak's place or its front surface against the export's) is the next thing to read",
    },
  ],
  openQuestions: [],
};
