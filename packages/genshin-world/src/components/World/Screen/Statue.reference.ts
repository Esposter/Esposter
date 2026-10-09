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
  ],
  openQuestions: [
    "Our statue's shape is radial profiles fitted from its meshes (one run of sections per export part, `windrise/statue.json`, a radius at each of 16 angles per tenth of a metre), which read an outline of 2.67 pixels against 1, a depth of 0.0084 against 0.01, held, and a normal of 37.5 degrees against 10 since the statue stands at its export's height. The figure, the dish's underside and the stand's leaves carry most of the normal error, and no radial profile reaches the gate on them: which representation the figure takes is the roadmap's call. Still the kits': the oak's height and shape, and which of the statue's levels the recordings show",
    "Its colour per part (each export mesh's material in its own colour, `windrise/surfaces.json`) reads 2.96 ΔE against 2.30, from 9.17 with the stone and the figure in one colour, so the gate still fails. Its surface structure reads 0.649 share against 0.0553, failing, and its structure before this change was not read",
  ],
};
