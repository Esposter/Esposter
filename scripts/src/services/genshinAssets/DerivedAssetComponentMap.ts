import type { DerivedAssetComponentOptions } from "#src/models/genshinAssets/DerivedAssetComponentOptions";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

// Each component's roots, which `extract` follows every pointer from, and the assets no pointer from them reaches by
// The name the game gives them, which the asset index turns into the blocks holding them. The login screen's roots are
// Its own scene, `LoginScene`, whose `MonoLoginScene` spawns its prefabs into the empty anchors under `SceneObj`, and
// The arrangements it shows, of the several its blocks lay its meshes out in: the character select's stage, which holds
// Its towers, bridges, pillars and door at 0.4 scale (the door capture's door is that size), and the walkway, the
// Prefab `MonoLoginScene` spawns. Its sky is its Enviro package's, named exactly since the sky's names recur across the
// Game: the sky dome and the cloud layer's meshes, the cloud layer's and the three cloud emitters' materials (an
// Emitter's renderer exports without the fields that point at them), their particle atlases and density maps, and the
// Sky gradient every one of them is coloured by. Its interface is `LoginMainPage`, in the block beside its
// `Ani_LoginMainPage_Waiting` clips, and its clips are the page's, the progress bar's, the lift at its end and the
// Door's; `Start` and `End`, a name the whole game reuses, are left to its reference
export const DerivedAssetComponentMap: Record<DerivedAssetComponent, DerivedAssetComponentOptions> = {
  [DerivedAssetComponent.Login]: {
    clipPattern: "^(Ani_LoginMainPage_|Ani_LoginProgressBar_|Ani_Login_Lift$|Ani_LogginScene_Door01_)",
    interface: { anchorPattern: "^Ani_LoginMainPage_Waiting", root: "LoginMainPage" },
    namePattern:
      "^(Enviro_(Sky_Gradient|Clouds_(Middle_|Top_)?Particle_Atlas|Clouds_(Voronoi|Wispis|Normal)|Cloud_(Layer|Particle|Mid_Particle|Top_Particle)_Mat|Atmosphere_Layer_Mat)$|(Sky|Cloud)_LOD0$)",
    // The walkway's own parent is in a block not read, so it is dumped at the origin at full scale. The login's own scene
    // Hangs the walkway and the door at one scale (its BridgeBeginNode and DoorNode), so its parent is the door's: 0.4
    // Scale, 5 metres down, which brings its far edge to the door 32.3 metres out with no shift along its axis, and
    // Its width to the door's as the current build's door frame shows (Login/Scene/Index.reference.ts, source `door`)
    rootParents: { LoginScene_Bridge01_Vo: { position: [0, -5, 0], scale: 0.4 } },
    roots: [
      { block: "00/11790361.blk", name: "LoginScene", pathId: "-1124867853248233309" },
      { block: "00/04803507.blk", name: "CharacterSelectSceneNew", pathId: "4480618066175235850" },
      { block: "00/16000354.blk", name: "LoginScene_Bridge01_Vo", pathId: "-64394072878925827" },
    ],
  },
};
