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
    {
      method:
        "The envelope's closing radius swept from 1 to 100 pixels on the exports' two halves and on ours, with the targets drawn from the front alone and then with each source's sides, the exports' leaf cards from both and a face from behind reading its geometry's own normal; the halves' closed masks' holes read at each radius against the whole's",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The radius from one card's 5.9 m measured the radius: from the front alone the floor's outline ran from 4.8 to 14.0 pixels across the sweep and ours from 5 to 54. Drawn from both sides the floor's outline holds within 4.3 to 7.5 pixels, its depth and normal falling as a windowed mean's scatter does, and ours misses all three at every radius past the cards' spacing. The leaf mesh holds no back face for any card, so the game draws its cards from both sides; with `normalWorld`'s flip on a back face the halves read 75 to 80 degrees apart. The radius is now the cards' spacing, the least at which every hole either closed half leaves is one the whole leaves too: 11 pixels, 1.1 m at the crown's median depth (29 from the front alone). There the floor reads 5.43 pixels, 0.101 and 17.4 degrees and ours 13.7, 0.141 and 26.5, and the per-card Oak 2.25 pixels, 0.169 and 32.1 degrees, from 2.21, 0.195 and 39.9",
    },
    {
      method:
        "The crown's leaf against the export's: the kept leaf area (each triangle's area times the share of its texture its `_Cutoff` keeps) by height, by reach from the axis and by depth into the crown, per cluster, and projected to the reference camera; then candidate layouts swapped into the page's oak in place and read on the envelope, each count in multiples of the export's kept leaf, and our cards set at the export's own card and triangle places as a ceiling no shipped layout may pass",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The layout's shape matched: by height, reach and depth into the crown ours stood within a few thousandths of the export's shares. The count did not: 32,000 cards of 13.3 square metres kept 426,000 against the export's 61,000, about seven times, and the export's clusters hold from 3,800 to 11,600 square metres of card where ours held 800 cards each. At the export's own leaf ours reads too thin (seen through 10% of its crown against the export's 6%, its depth 7.5% too far), as opaque at about twice it, and its envelope reads nearest at three times; a cluster's cards spread as a Gaussian or by the export's own radial profile read further, and the leaf on a 4 m or a 2 m grid at three times it reads 15.7 or 13.2 px. Finer clusters close the rest: at three times the leaf, 40 clusters read 14.9 px, 0.120 and 27.6 degrees, 640 read 12.4, 0.099 and 25.1 and 1280 read 11.2, 0.096 and 24.7, across seeds 11.2 to 11.7 px, 0.096 to 0.106 and 24.0 to 24.7 degrees. Our cards at the export's own triangles read 10.8 px, 0.119 and 23.2, so no layout of them passes. Landed: 1280 clusters, each with the leaf it holds, its cards keeping three times that (13,700 cards). The envelope reads 12.1 px, 0.099 (held) and 24.2 degrees, the per-card Oak 1.91 px, 0.133 and 30.8, the Ground's outline 3.54 from 4.09, its depth 0.0382 from 0.0380 and its normal 9.66, held. Of the outline 5.6 pixels lie under the crown, the bark's surface roots, which the kit does not draw; where both show the same layer the leaves' normals differ by 18.0 degrees, 15.7 with our cards at the export's places",
    },
    {
      method:
        "The bark's surface roots fitted from its Lod1 mesh's second submesh, the one its second bark material draws, by `genshin:assets fit windrise --only oak`: each of its 35 pieces traced from its open end, where it leaves the trunk or the root it forks from, by its vertices' distance along its edges, cut every half metre into the loops its centreline runs through, each loop's centroid and mean radius a point, simplified within 5 cm (`traceRootCentrelines`), and swept by the tree kit as tubes along centripetal Catmull-Rom splines (`computeRootTubes`) in the bark's own geometry and material; then the shape pass at the reference camera, on this Mac, its baseline retaken first",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Landed. The 35 roots, 505 points, overlay the export's from above and the side within their own radii but at the foot's flare, where the export's loops are long and ours round. The envelope's outline falls from 12.52 to 10.04 pixels against the floor's 5.43, its depth from 0.0988 to 0.0970 (held, 0.1005) and its normal from 24.25 to 24.15 degrees against 17.33 (the PC read 12.05, 0.099 and 24.2 before); the per-card Oak 1.92 pixels, 0.133 and 30.7 to 1.77, 0.132 and 30.5, the Ground's outline 3.64 to 3.31 and its depth 0.0448 to 0.0437, its normal 12.99 held to the hundredth; the statue and the paving unchanged. Of the 5.6 pixels under the crown 2.5 closed: the rest is the trunk, which the kit stands straight on the axis at 7.6 m where the export's leans off it and parts into limbs, and roots our hills bury before the trunk. Tried and not landed: the trunk's taper read off its own submesh, the roots left out (6.98 and 7.21 m at its two lowest stations for 7.61 and 7.36), 9.999 pixels and 24.17 degrees, too small a move to carry a change; every root lifted half a metre clear of our ground, 10.58 pixels and 24.34 degrees, so the export's own heights stay",
    },
    {
      method:
        "Each family's surface read under its material's main colour, `_Color`, as the witness draws a texture tinted by it: `fitSurfaceColours` reads each placed material's diffuse texture through `tintTexture` (each texel decoded to linear light, multiplied by the tint and encoded back) before its samples and its detail, then `genshin:assets fit windrise --only surfaces` and the surface pass at the reference camera on this Mac, its baseline retaken first. The oak's bark materials tint by 0.918, 0.873 and 0.873, its leaf by white, the statue's by 0.871 grey and 0.871, 0.773 and 0.803, the paving's by white, and the terrain's base maps by nothing",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Landed, as what the exports show, though the tint was not the oak's miss. The bark's colour reads #726140 from #766845 and the leaf's #617f56, unchanged; the statue's parts darken (its stone #62676a from #696e71) but it draws its stacks' own tinted colours, so only its detail moves. The oak's colour reads 5.2955 ΔE from 5.1478 and its structure 0.7369 share from 0.7431, the statue's 1.3361 from 1.3225 (held) and 0.0994 from 0.0987, the paving's 0.5030 and 0.5003 and the ground's 1.7335 and 7.4485 unchanged. Refitted at the parent the record keeps every colour but brings its family details up to the fit's current code (the ground's variance 0.0587 from 0.0579, the oak's 0.0349 from 0.0199), which moved no reading",
    },
  ],
  openQuestions: [
    "The trunk and its first limbs: the kit's trunk stands straight on the oak's axis, stepped down the bark's 90th percentile, where the export's trunk stands off the axis, leans and parts into limbs low under the crown, which is most of what the envelope's outline still misses under the crown",
    "Its colour per part, the bark and the leaves each read from their own mesh's textures under their tints (`windrise/surfaces`), reads 5.30 ΔE against 2.30 on this Mac, and its structure 0.737 share against 0.035. The surface image shows our crown paler and greyer than the exports' saturated greens, light and dark in about equal parts, so the miss is the leaf's chroma as our cards draw it rather than the record's lightness. A second lead, measured offline and not built: the fit averages a texture's sRGB bytes where the pass averages linear light, which reads the leaf's texture 1.9 ΔE darker than its linear mean (#617f54 against #668254) and the statue's 2.7, the bark's 0.1",
  ],
};
