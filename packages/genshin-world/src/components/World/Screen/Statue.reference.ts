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
  ],
  openQuestions: [
    "Our statue's shape is radial profiles fitted from its meshes (one run of sections per export part, `windrise/statue.json`, a radius at each of 16 angles per tenth of a metre; the outline is unchanged by the split), which read an outline of 10.8 pixels against 1, a depth of 0.020 against 0.01 and a normal of 46 degrees against 10: a lathe read 12.7, 0.022 and 37, and 32 angles read 10.9, 0.019 and 49. The stone's base is not round and the figure is a robed body with arms, and the stand's base and its level-three mesh carry most of the normal error. Still the kits': the oak's height and shape, and which of the statue's levels the recordings show",
  ],
};
