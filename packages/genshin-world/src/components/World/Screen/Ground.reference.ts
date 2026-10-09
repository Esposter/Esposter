import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// Windrise's ground: the terrain tiles, where their heights are kept, and the exact points on them
export const groundTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "Every BigWorldTerrain base map exported and laid out by its tile's name, with the six statues' points marked under columns of x over 1024 and rows of z over 1024",
      outcome: InvestigationOutcome.Found,
      result:
        "Mondstadt's ground is BigWorldTerrain tiles of 1024 metres: their base maps laid out by name show Dragonspine's snow under its statue, Starfell's statue to its north and Galesong's to the east, with Windrise's between Dragonspine and Cider Lake in tile 1,-2 near its east edge. The ErosionHeightmap tiles and the far fog's height tiles cover other regions only",
    },
    {
      method:
        "The asset index for every asset naming the tile, then the raw blobs of the tile's two texture blocks by size and header",
      outcome: InvestigationOutcome.Found,
      result:
        "The tile's base map, splat alphas, tint, mask and specular textures and its CTS profile are named in the asset index; its heights are not, since the index holds no TerrainData. The texture blocks' MiHoYoBinData blobs are another area's placements, not a heightfield",
    },
    {
      method:
        "BigWorld_1_-2_BSM_* exported raw, the grids' cell tables read, and each 16-metre cell's median value correlated with the ground points in it under every cell order",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "The tile's BSM text assets are not heights: a header of four grids, 64 cells a side down to 8, each cell a run of four-byte items, but a cell's values follow none of the sector's ground points under it, and the Firmament's scene carries the same format",
    },
    {
      method:
        "TerrainData exported raw from the tile's texture blocks, which held tile 1,1's, its heightfield found by the square count followed by its error and bound arrays and its side twice",
      outcome: InvestigationOutcome.Found,
      result:
        "A tile's heights are a TerrainData, 513 samples a side two metres apart over a kilometre of height, which AnimeStudio exports unparsed as TerrainData#<n> with its name only inside its bytes, so no name filter reaches it",
    },
    {
      method:
        "Every TerrainData of every block exported raw and named by the string its bytes lead with, then the tile's heights compared with every small placement's height in both orders",
      outcome: InvestigationOutcome.Found,
      result:
        "Tiles 1,-2, 2,-2 and 1,-1 are in 00/00945879.blk and 2,-1 in 00/13138169.blk. A tile's samples run along z within each column of x, stand on the world's zero, and match the tile's ground placements to a tenth of a metre at the median",
    },
    {
      method:
        "The asset index for MonoBehaviours naming the tile, then each one's raw bytes scanned at every offset for three floats inside the tile's x and z and a height of the region's",
      outcome: InvestigationOutcome.Found,
      result:
        "BigWorld_1_-2, a SectorBinData script, holds about fourteen hundred positions packed twelve bytes apart, every one inside the tile, those round the statue within two metres of its height: points on the ground about one every 27 metres, exact data a fitted ground can be held to. BigWorld_1_-2_Index, its sibling, holds no position in the tile's range",
    },
    {
      method:
        "The ground refitted at three-metre steps with hills down to four metres wide, against the six-metre fit with hills down to fourteen, each judged by the Shape pass at the reference camera",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "The fit's error falls from 0.62 to 0.14 metres within 60 metres and from 2.71 to 0.79 within 700, and the Ground's normal from 10.0 to 6.2 degrees, which holds its gate, and its depth from 0.037 to 0.017. Its outline rises from 16.7 to 17.7 pixels, the paving's from 3.6 to 4.2 and the oak's depth from 0.19 to 0.21, so the change is not landed: a mixed result. Its flowers are about two pixels of the outline, which stays near 15.5 without them, and the outline's largest misses lie where the reference's oak canopy covers ground the stand-in shows and along the horizon, not on the cliffs. No terrain fit closes the outline gate while the oak's canopy does not match",
    },
    {
      method:
        "The surface pass's albedo targets read back at the reference camera, the exports' Ground mean against ours and against each tone of the fitted palette in CIELab, then the base maps' size against the detail octaves' texel scale",
      outcome: InvestigationOutcome.Found,
      result:
        "The paint's one colour, #707e5d, is the base maps' mean over every terrain face within the terrain radius, weighted by area: the meadow's green (51% of the samples), bare earth (37%) and a pale rock (11%) averaged, while the camera sees the meadow. The exports' Ground there reads L 46.1, a -21.1, b 24.3, 13.42 from ours and 1.99 from the palette's green, #53733e. One colour has no variance, so the structure reads 1.0000. A base map is 512 texels over a 1,024-metre tile, 2 metres a texel, but `SURFACE_DETAIL_METRES_PER_TEXEL` draws every texture's octaves at 4 centimetres a texel, 50 times too fine, and the base map's variance of 0.058 is the whole tile's layout: the detail tried on the ground drew that as per-pixel noise, structure 207.2",
    },
    {
      method:
        "Each TerrainData's bytes ahead of its heights read by their shapes in every region's tiles, its 256-square byte map set against Windrise's base maps' texels each classed to the nearest palette tone, and every base-map texel within the terrain radius classed and binned by its slope",
      outcome: InvestigationOutcome.Found,
      result:
        "The bytes are the tile's splat database: up to seven layers, each its diffuse, normal and mask pointers, its tiling of 4 to 16 metres and a kind, then two control maps, both resolutions 1024, and a byte a four-metre cell naming its layer, which matches one base-map tone on 91 to 95% of each tile, kind 1 always the grass. The slope sorts no tone: flat ground is about half grass and half earth, and steep ground mostly grass. So the layers are placed spatially, never by slope",
    },
    {
      method:
        "A field of each layer's shares fitted from the classed base-map texels at 16, 32 and 64 metres, read at the reference's camera against the base maps before any was built, then the 32-metre field drawn and read by the Surface pass, with and without the shore's sand band over it",
      outcome: InvestigationOutcome.Found,
      result:
        "Off the base maps: 64 metres misses the gate at about 3.2 ΔE for 11 KB, 32 metres holds at about 1.7 for 39 KB, and 16 metres gains a third of a ΔE for 138 KB; a slope factor inside a cell only misclasses more. Drawn at 32 metres, the Ground colour reads 1.55 ΔE against 2.30, from 9.10 under the slope bands, and 6.41 with the sand band laid over it, whose texels are three quarters earth. No other family's colour moves (the Statue's 5.19, failing since its stacks landed, reads the same without the field), and the Shape pass's held readings hold",
    },
  ],
  openQuestions: [],
};
