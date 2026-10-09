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
    {
      method:
        "The Oak family's depth at the reference camera, ours against the export's per pixel: the signed gap by the export's depth band, the family's centroid and extent, and the export's leaves (each card's size, its facing against the radial direction, and each triangle's distance from its cluster centre over the cluster's radius)",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Not a placement offset: the median of ours over the exports' depth is 1.006, and the signed gap changes sign with depth, ours 15% farther where the export's crown is nearest (27 to 37 metres) and 1 to 6% nearer past 64 metres. The leaves' signed mean is 0.06 of their 0.186 gap, so most of the 0.180 is per-pixel scatter rather than a shift. The export's leaves are 5.9-metre cards at random facings (mean cosine 0.50 against radial) with centroids peaking at 0.6 to 0.8 of their cluster's radius, so radial facing and a shell at the radius are not what the export shows, and the card size already matches it. Cards per cluster from 400 to 800 lower the depth to 0.164 and the normal to 47.7 degrees, the outline rises to 8.41 pixels, and the Ground's normal holds at 9.6 degrees, so it lands. 1600 cards a cluster never reached the page's ready state within the parity timeout and is not recorded",
    },
    {
      method:
        "The oak's place in the scene against the witness layout's: the landmark's root height, then `oak.json`'s clusters tested as a k-means fixed point of the leaf mesh's triangles under each axis convention, then the shape pass with the root at the export's height and the clusters carried by the leaf placement",
      outcome: InvestigationOutcome.Found,
      result:
        "The scene stands the oak's root on our ground plus -0.5 metres, at -0.53, where the export's stands at 0; and the fit reads the leaf mesh in its own frame, dropping its placement (0.6 metres down and a turn of 2.28 degrees, 1.6 to 2.4 metres at the crown's rim). With both exact the oak reads 9.06 pixels, 0.161 and 47.5 degrees (8.41, 0.164 and 47.7 before); with the root alone, 8.08, 0.174 and 47.4; the turn reversed, 8.87, 0.170 and 48.3. The canopy's readings are the cards' scatter, so a placement barely moves them",
    },
    {
      method:
        "The leaf mesh's vertex normals against its faces, a sphere about the crown, flattened hulls, a sphere per k-means cluster and the clusters' union gradient, then the normals averaged on a grid and read back on held-out cards, each by the mean angle per vertex",
      outcome: InvestigationOutcome.Found,
      result:
        "The game's leaf normals are a smooth field over the crown, the underside pointing down and the top up: vertices within 3 metres agree to 18 degrees, while they stand 89 degrees from their own faces. Ours radiate from each of the 40 clusters' centres, 65 degrees from the game's; the clusters' union gradient at 1.5 radii reads 34 to 36 degrees, a flattened hull 52, and the grid's field 12.5 degrees at 3-metre cells, 15.1 at 4, 18.9 at 6 and 22.1 at 8, held out",
    },
    {
      method:
        "The witness's leaf material clipped at its `_Cutoff` against `_MainTex` alpha and every target material given its source's opacity and alpha test, then the shape pass",
      outcome: InvestigationOutcome.Found,
      result:
        "The game's leaf texture is 81% cut at its `_Cutoff` of 0.5, but the witness draws its cards whole and every target draws ours whole too. Cut on both sides the oak reads 2.07 pixels over an outline 8.7 times longer, with 163,000 pixels apart against 73,000, a depth of 0.196 and a normal of 57.1 degrees, and the Ground's outline 3.80 pixels: leaf against leaf, the readings are the leaves' scatter. `_Cutoff` stands at 0.5 on nearly every exported stone material too, the login's and the paving's among them, so the clip is keyed on the foliage shader, never on the property",
    },
  ],
  openQuestions: [
    "Its colour per part, the bark and the leaves each read from their own mesh's textures (`windrise/surfaces.json`), reads 3.29 ΔE against 2.30, from 3.82 with the family in one colour, so the gate still fails. Its surface structure reads 0.5499 share against 0.0324, failing, and its structure before this change was not read",
  ],
};
