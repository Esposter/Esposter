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
        "The canopy fitted to the export's own leaves rather than a species' random clusters, by `genshin:assets fit windrise --only oak`: seeded k-means of the Lod1 leaf mesh's triangle centroids into 40 clusters, each reaching the 90th percentile of its cards, 400 cards a cluster, the trunk stepped down the bark's own Lod1 taper from 7.6 metres at the foot to 5.2 at 12, each judged by the Shape pass at the reference camera",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Landed. The oak's outline falls from 63.5 to 8.1 pixels, its normal from 79.1 to 48.4 degrees and its depth from 0.189 to 0.180, all three still failing their gates (1 pixel, 0.01, 10 degrees), so the depth's move is the record of the change. The Ground's outline falls from 16.7 to 9.6 pixels with its normal held at 9.7 degrees and its depth at 0.0373 against 0.0374; the statue and the paving are unchanged. The fit reads the export's axes as the other fits do (mirrored across z), a half turn about the trunk from a raw read of the file, which gave 11.7 pixels, normal 48.5 and depth 0.212 with a percentile taken on the lower rank. The cluster centres match that read exactly under the half turn; the radii, now on the nearest rank, sit up to 0.16 metres wider at the canopy and 0.4 at the trunk. Eighty clusters lowered the outline further in the raw read (10.0 pixels at 400 cards a cluster) and raised the depth to 0.224, so the forty stay",
    },
  ],
  openQuestions: [],
};
