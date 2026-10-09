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
        "The statue's maps bend its normals 10.5 degrees, 10.4 and 10.6 over its halves, over the 10-degree gate on their own; offline the export's own geometry with its own normals reads 10.6 degrees against its bent normals, and with normals read off its geometry, creased at 60 degrees, 9.7. No stand-in that ships without the game's maps holds the gate, however exact its geometry, which the scene derivation's decisions answer: the shape is read on the geometry's normal and the maps' bend in distribution. Against the geometry's normal the stacks read 14.8 degrees offline, so the geometry still misses on its own",
    },
    {
      method:
        "The surface pass's targets read back at the reference camera and rebuilt offline: each pixel's export mesh off the exports' part target, ours rastered from the stacks at the same camera (outline 0.500 px, depth 0.0016 and geometry normal 14.84 degrees where the page reads 0.498, 0.0017 and 14.84), the exports' albedo rebuilt from their textures under their materials' tint (0.23 ΔE off the page's), and each colouring of ours scored by the pass's mean colour and its structure statistics, keeping the detail the page drew ours with",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Coverage is not the regression. Over the overlap each mesh's share is the exports' within a point (Base 27.2% against 26.4%, Level4AllExtra 14.0 against 14.1, Level3AllExtra 26.5 against 26.8), 91.4% of its pixels drawing the same mesh, and with every pixel given the exports' own mesh in its published colour the statue still reads 5.18 ΔE and a structure of 0.584, so no refit of the pedestal or the trims reaches the gate. The gap is one colour a mesh: each mesh's surface in view is warmer than its mean over every face, undersides and faces no view shows among them (Base's b* 7.3 against 0.1, Level3MoveExtra's 12.5 against 2.3, Level3AllExtra's 20.4 against 15.6), and the radial profiles at 0f56ef73d2's parent read 1.65 only by over-covering the gold dish, 20.3% of the overlap where the exports show it at 14. One colour a stack reads 3.68 ΔE and 0.498, one a ring 3.28 and 0.282, and one a vertex 1.11 and 0.127. Each stack's vertices now carry their own colour, the mean of the six of their piece's 20,000 fitted points nearest them, each point its export texture's texel under its material's tint: offline 1.33 ΔE and 0.094, on the page 1.32 and 0.099 from 5.22 and 0.596, the shape unchanged (0.498 px, 0.0017 and 14.84 degrees). The record grows from 313 KB to 614 KB, 170 KB compressed",
    },
  ],
  openQuestions: [
    "Our statue's shape is stacks fitted piece by piece to its meshes (`windrise/statue.json`), reading an outline of 0.50 pixels against 1 and a depth of 0.0017 against 0.01, both held. The shape pass reads its normal on the geometry, as the scene derivation decides, at 14.8 degrees against 10, the hood, the wings, the dish and the leaves most, so the stacks' geometry still misses on its own; the 16.8 degrees read with the game's normal maps is a diagnostic. The maps' bend, 10.5 degrees, is gated apart as a surface detail and fails until a procedural normal detail fitted to it ships on the statue's material. Still the kits': the oak's height and shape, and which of the statue's levels the recordings show",
    "Its colour is each stack vertex's, read off its piece's export texture under its material's tint, and reads 1.32 ΔE against 2.30, held; its surface structure reads 0.099 share against its gate of 0.070 and still fails. Part of what is left is our detail, each part's procedural noise: offline, the exports' own albedo drawn under it reads 2.10 ΔE, 1.8 L* under theirs, a darkening the vertices' slightly brighter colours offset. The detail fitted to the statistics of the statue's own pixels, rather than its parts' whole textures, is the structure's next measure",
  ],
};
