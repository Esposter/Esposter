import type { DerivedAssetComponentOptions } from "#src/models/genshinAssets/DerivedAssetComponentOptions";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

// Each component's roots, which `extract` follows every pointer from, and the assets no pointer from them reaches by
// The name the game gives them, which the asset index turns into the blocks holding them. The login screen's roots are
// Its own scene, `LoginScene`, and the prefabs its `MonoLoginScene` spawns into the empty anchors under `SceneObj`:
// The towers' `LoginScene_Build_All`, the walkway and the door. Its sky is its Enviro package's, named exactly since the sky's names recur across the
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
    roots: [{ block: "00/11790361.blk", name: "LoginScene", pathId: "-1124867853248233309" }],
    // What MonoLoginScene's raw bytes point at, each into the anchor it names before it (Login/Scene/Index.reference.ts)
    spawns: [
      {
        anchor: { block: "00/11790361.blk", name: "SceneBeginNode", pathId: "-6576348029719316063" },
        prefab: { block: "00/16000354.blk", name: "LoginScene_Build_All", pathId: "-8673399039441092392" },
      },
      {
        anchor: { block: "00/11790361.blk", name: "BridgeBeginNode", pathId: "811367706567901226" },
        prefab: { block: "00/16000354.blk", name: "LoginScene_Bridge01_Vo", pathId: "-64394072878925827" },
      },
      {
        anchor: { block: "00/11790361.blk", name: "DoorNode", pathId: "-6725424664267825220" },
        // At the flight's end the door stands on the walkway's top, centred on it, 5.6 metres along it from its origin
        // Toward its far end: the distance from the door's pose and the walkway's on one frame of login-door-recording,
        // The door's turn held to the walkway's; the two solves scatter the foot by a few centimetres either side of
        // The top and the axis, so it stands on both
        position: [262, -340.68, -643.74],
        prefab: { block: "00/11790361.blk", name: "LoginScene_Door01_Vo", pathId: "3964741434016489810" },
      },
    ],
  },
};
