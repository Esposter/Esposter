import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The Statue of The Seven: its gadget, its scene point, its prefab and its place under the oak
export const statueTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "GadgetExcelConfigData for the gadgets named Statue of The Seven, then the asset index and the raw asset map for its names",
      outcome: InvestigationOutcome.Found,
      result:
        "The Statue of The Seven is gadget SceneObj_Resident_Goddess, Mondstadt's of the five; its meshes are Stages_MdGoddess01's by level. No prefab named for the gadget is in the asset map or the index",
    },
    {
      method:
        "scene3_point.json for every point naming gadget 70110001, each point's area resolved through the area table and TextMap_MediumEN",
      outcome: InvestigationOutcome.Found,
      result:
        "Windrise's statue is the overworld's scene point 4: of the six statues the points place in Mondstadt, the one whose area is 201, which WorldAreaConfigData names Windrise under Galesong Hill",
    },
    {
      method:
        "The CABs that depend on the statue meshes' CAB through AnimeStudio's CAB map, their GameObjects named Goddess, then GadgetExcelConfigData's prefab hash for gadget 70110001 decoded against the 2.6 index",
      outcome: InvestigationOutcome.Found,
      result:
        "The statue's prefab is SceneObj_NPC_Goddess: the gadget's prefabPathHash holds that path's PathHashPre and PathHashLast as a placement's 64-bit hash does, and of the gadget roots holding Stages_MdGoddess01_Lod0 it is the one without a nation's suffix",
    },
    {
      method:
        "The statue's point and the oak's placement against the tile's heightfield, the statue's prefab in the witness layout, every placement within twelve metres named through the 2.6 index, then tiles 1,-1 and 2,-2 exported for the other Mondstadt statues' placements and the dais's id, and the tile's and area's HLOD meshes searched round the statue",
      outcome: InvestigationOutcome.Found,
      result:
        "The statue stands 44 metres east of the oak's foot and 7 below it, turned a quarter about the vertical; its meshes hang at its root unmoved, and the root stands 0.8 metres over the tile's ground while the oak's is 0.95 under it. The recordings show the statue on a stepped stone dais: a prefab of the tile's under it, world id 2751255372 with a nine-metre streaming radius, carrying no path hash here, in tiles 1,-1 and 2,-2 under the other statues, or in either HLOD near it",
    },
    {
      method:
        "The statue prefab's Transforms and its meshes' bounds in the witness layout, each child's place and scale",
      outcome: InvestigationOutcome.Found,
      result:
        "The statue is about eight metres tall: its figure is a mesh of its own, Stages_MdGoddess_Lite01_Lod0, hung 4.2 metres up the root at a scale of 2.69, over Level4AllExtra's wide dish at 4.1 to 4.4 metres",
    },
    {
      method:
        "The shape pass's part, depth and normal targets read back at the reference camera, each family's outline split by what the other side draws there, then our statue's mask shifted over the export's for the best overlap",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Ours stood 33 pixels under the export's at the same height: the scene stood the statue on our ground plus a hand offset of -0.2 metres, 0.97 metres under the export's root at -6.91, where our ground is within 3 centimetres of the tile's. Its offset is now 0.77, that root's height over our ground: the outline falls from 10.83 to 2.67 pixels, the depth from 0.0197 to 0.0084, now held, and the normal from 42.6 to 37.5 degrees, and the Ground's outline from 9.56 to 8.67. The layout pass reads no landmark's root where the scene stands it, so it held",
    },
    {
      method:
        "The normal target drawn with each part's geometric normal in place of the export's normal map, then the radial stack lofted through each section's middle in place of its ledges",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "Without the normal map the normal reads 37.2 degrees against 37.5, so the map is not the gap. Lofted, the statue reads 2.44 pixels, 0.0079 and 35.5 degrees. What is left is the radial profile itself: the figure (Lite01, 45 degrees over 23% of the angle), the dish's underside (Level4AllExtra, 60 degrees) and the stand's leaves, which no outermost radius per band holds",
    },
    {
      method:
        "Each statue mesh split into the pieces its triangles join into (the figure's robed body, its hood, its two wings, its arms and hands; the stone's base, column, rings, dish and leaves), each candidate kit fitted to one piece and drawn in its place with every other piece the export's own, read at the reference camera as the shape pass reads it, on an offline raster of the pass that reads the shipped profiles at 2.42 pixels, 0.0078 and 35.5 degrees where the page reads 2.44, 0.0079 and 35.5",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Over the thin pieces (the wings, arms, hood, leaves, grass and the dish's underside), what each kit adds to the statue's outline and normal: a radial profile per piece at 64 angles every 2 centimetres 1.33 pixels and 9.9 degrees, one stack along the piece's own axis 0.59 and 6.7, ellipsoids fitted by moments 0.37 and 3.8 at 8 a piece and 0.28 and 4.2 at 24, and the piece split by k-means into blades, each a stack along its own length, 0.42 and 2.7 at 4 blades, 0.23 and 2.3 at 6 and 0.32 and 2.2 at 10. Over the upright pieces, a stack with each ring about its own section's centroid adds 0.20 and 2.2 at 32 angles every 5 centimetres, against 0.20 and 3.4 for the radial profile there. Split into blades, the thin pieces read nearer than as ellipsoids on both counts, so the kit is the stack alone, upright or as blades, chosen per piece from no view by the two-way distance between samples of its surface and ours and their normals' angle. Fitted whole at 32 angles upright and 12 a blade every 5 centimetres it reads 0.50 pixels, 0.0016 and 16.8 degrees offline in 313 KB, against 0.57, 0.0015 and 15.3 at 16 angles a blade every 3 centimetres in 468 KB and 0.66, 0.0020 and 19.0 at 16 angles upright every 10 in 250 KB. On the page the statue reads 0.4953 pixels, 0.0017 and 16.8 degrees, its outline and depth held, the Ground's outline 8.15 from 8.34 and every other reading as it was. The figure's pieces read their normals at 14.1 degrees on the body, 32.2 on the hood, 27.8 and 21.1 on the wings, 19.4 and 25.7 on the arms and 19.1 on the hands, and none puts more than 0.05 pixels on the outline",
    },
    {
      method:
        "The shape notes' bend of each family's own normal maps: the exports' normal target against the normal their geometry carries before the maps, over the family's pixels and over its two halves of 32-pixel blocks; offline, the exports' own geometry drawn with their own normals and with normals read off the geometry, both without the maps, against the target",
      outcome: InvestigationOutcome.Found,
      result:
        "The statue's maps bend its normals 10.5 degrees, 10.4 and 10.6 over its halves, over the 10-degree gate on their own; offline the export's own geometry with its own normals reads 10.6 degrees against its bent normals, and with normals read off its geometry, creased at 60 degrees, 9.7. No stand-in that ships without the game's maps holds the gate, however exact its geometry, which the recreation passes' decisions answer: the shape is read on the geometry's normal and the maps' bend in distribution. Against the geometry's normal the stacks read 14.8 degrees offline, so the geometry still misses on its own",
    },
  ],
  openQuestions: [
    "Our statue's shape is stacks fitted piece by piece to its meshes (`windrise/statue.json`), reading an outline of 0.50 pixels against 1 and a depth of 0.0017 against 0.01, both held, and a normal of 16.8 degrees against 10, which no stand-in without the game's normal maps can hold (10.5 degrees their bend alone). The shape pass reading the geometry's normal, and the maps' bend in distribution, is the recreation passes' decision still to build; against the geometry's normal the stacks read 14.8 degrees offline, the hood, the wings, the dish and the leaves most. Still the kits': the oak's height and shape, and which of the statue's levels the recordings show",
    "Its colour per part (each export mesh's material in its own colour, `windrise/surfaces.json`) reads 5.19 ΔE against 2.30 with the stacks, from 2.96 under the radial profiles, each mesh still one colour over all its pieces, and its surface structure 0.595 share against 0.0701, from 0.703, both failing. Whether a colour per piece closes it is the surface pass's, not yet read",
  ],
};
