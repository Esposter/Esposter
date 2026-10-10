import type { DerivedAssetComponentOptions } from "#src/models/genshinAssets/shared/DerivedAssetComponentOptions";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// Each component's roots, which `extract` follows every pointer from, and the assets no pointer from them reaches by
// The name the game gives them, which the asset index turns into the blocks holding them. The login screen's roots are
// Its own scene, `LoginScene`, and the prefabs its `MonoLoginScene` spawns into the empty anchors under `SceneObj`: the
// Towers' `LoginScene_Build_All`, the walkway and the door. Its sky is its Enviro package's, named exactly since the
// Sky's names recur across the game: the sky dome and the cloud layer's meshes, the cloud layer's and the three cloud
// Emitters' materials (an emitter's renderer exports without the fields that point at them), their particle atlases and
// Density maps, and the sky gradient every one of them is coloured by. Its interface is `LoginMainPage`, in the block
// Beside its `Ani_LoginMainPage_Waiting` clips, and its clips are the page's, the progress bar's, the lift at its end
// And the door's; `Start` and `End`, a name the whole game reuses, are left to its reference. Its music is the playlist
// `genshin:assets music` found over a recording of its title: two pieces with a rest after each, looping forever
export const DerivedAssetComponentMap: Record<DerivedAssetComponent, DerivedAssetComponentOptions> = {
  // A region's open world is derived from its capital's place (`deriveCapitalWorld`), so no region is rooted at its
  // Capital's index. Each `Area_<code>_City_Index` is the StreamGen chunk index of the capital's own area blob, a
  // MonoBehaviour holding a blob's chunk offsets and no game object: a root that is one walks to nothing, since the
  // Closure starts from the layout of game objects. The blob's placements, read beside the tiles its capital's view covers,
  // Are what holds the city's props and buildings, each a prefab rooted by its game object's name
  [DerivedAssetComponent.Fontaine]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  // The in-level HUD: its page is the `InLevelMainPage` GameObject, holding the minimap, the party and the skill buttons.
  // Its anchor is `TeamBtn_MP`, an Animator in no other block, since `GrpMainPage` is in four
  [DerivedAssetComponent.Hud]: {
    clipPattern: "^Ani_InLevelMainPage_",
    interface: { anchorPattern: "^TeamBtn_MP$", root: "InLevelMainPage" },
    roots: [],
    screen: "HudScreen",
  },
  [DerivedAssetComponent.Inazuma]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  [DerivedAssetComponent.Liyue]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  [DerivedAssetComponent.Login]: {
    clipPattern: "^(Ani_LoginMainPage_|Ani_LoginProgressBar_|Ani_Login_Lift$|Ani_LogginScene_Door01_)",
    interface: { anchorPattern: "^Ani_LoginMainPage_Waiting", root: "LoginMainPage" },
    musicPlaylistId: 792932714,
    namePattern:
      "^(Enviro_(Sky_Gradient|Clouds_(Middle_|Top_)?Particle_Atlas|Clouds_(Voronoi|Wispis|Normal)|Cloud_(Layer|Particle|Mid_Particle|Top_Particle)_Mat|Atmosphere_Layer_Mat)$|(Sky|Cloud)_LOD0$)",
    roots: [{ block: "00/11790361.blk", name: "LoginScene", pathId: "-1124867853248233309" }],
    screen: "LoginScreen",
    // What MonoLoginScene's raw bytes point at, each into the anchor it names before it
    // (Login/Scene/Index.reference.ts), the towers and the walkway with the count and length its record gives them,
    // Laid along ModelCamera's heading
    spawns: [
      {
        anchor: { block: "00/11790361.blk", name: "SceneBeginNode", pathId: "-6576348029719316063" },
        copies: { count: 3, step: [0, 0, -200] },
        prefab: { block: "00/16000354.blk", name: "LoginScene_Build_All", pathId: "-8673399039441092392" },
      },
      {
        anchor: { block: "00/11790361.blk", name: "BridgeBeginNode", pathId: "811367706567901226" },
        copies: { count: 3, step: [0, 0, -16] },
        prefab: { block: "00/16000354.blk", name: "LoginScene_Bridge01_Vo", pathId: "-64394072878925827" },
      },
      {
        anchor: { block: "00/11790361.blk", name: "DoorNode", pathId: "-6725424664267825220" },
        // At the flight's end the door stands on the walkway's top, centred on it, at its far end along +z: 3.1 metres
        // Beyond its wings' near faces, from the door's pose and the walkway's on one frame of login-door-recording,
        // The door's turn held to the walkway's and the camera's heading ModelCamera's. The two solves scatter the
        // Foot by a few centimetres either side of the top and the axis, so it stands on both
        position: [262, -340.68, -776.1],
        prefab: { block: "00/11790361.blk", name: "LoginScene_Door01_Vo", pathId: "3964741434016489810" },
      },
    ],
  },
  [DerivedAssetComponent.Mondstadt]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  [DerivedAssetComponent.Natlan]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  [DerivedAssetComponent.NodKrai]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  [DerivedAssetComponent.Snezhnaya]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  [DerivedAssetComponent.Sumeru]: { isCapitalWorld: true, roots: [], screen: "WorldScreen" },
  // Windrise is the open world's (World/Screen/Index.reference.ts): the statue's gadget prefab at its scene point, the
  // Oak's prefab at the one placement of Windrise's own area, the oak's finest meshes, which no prefab holds, and the
  // Four terrain tiles under the valley and the slopes north of it, with their base maps
  [DerivedAssetComponent.Windrise]: {
    namePattern: "^(Stages_Unique_CyTree01_(Bark|Leaf)_Lod0|BigWorldTerrain_(1|2)_-(1|2)\\.bin_BaseMap)$",
    roots: [],
    screen: "WorldScreen",
    world: {
      // The oak's foot is the origin of our Windrise, as our scene has always stood round it
      origin: { block: "00/16170614.blk", name: "Stages_Unique_CyTree01_Lod1", pathId: "6733514611168788700" },
      points: [
        {
          category: "NNGAFPEMOML",
          file: "BinOutput/Scene/Point/scene3_point.json",
          id: "4",
          position: "NPCCBOFKBCO",
          prefab: { block: "00/04803507.blk", name: "SceneObj_NPC_Goddess", pathId: "1660930449232041872" },
          rotation: "EGALADGLFJM",
        },
      ],
      regionLandmarks: [
        { id: "windrise-great-oak", pathId: "6733514611168788700" },
        { id: "windrise-statue-of-the-seven", pathId: "1660930449232041872" },
      ],
      streams: [
        {
          blob: { block: "00/03254716.blk", name: "6977197b" },
          index: { block: "00/03254716.blk", name: "Area_FQD_City_Index" },
          prefabs: [
            {
              prefab: { block: "00/16170614.blk", name: "Stages_Unique_CyTree01_Lod1", pathId: "6733514611168788700" },
              prefabId: 3_891_970_487,
            },
          ],
        },
        // The tile's own placements, of which Area_Md_Water_Common_01_Vo, named by its path hash, is the valley's water,
        // And the two paving stones under the statue's dais steps, whose centres a recording's camera is solved by
        {
          blob: { block: "00/05825684.blk", name: "012854bd" },
          index: { block: "00/05825684.blk", name: "BigWorld_1_-2_Index" },
          prefabs: [
            {
              prefab: {
                block: "00/05652564.blk",
                name: "Area_Common_Build_Ruin_H_06_Vo",
                pathId: "3982752075327930387",
              },
              prefabId: 3_350_382_359,
            },
            {
              prefab: {
                block: "00/05652564.blk",
                name: "Area_Common_Build_Ruin_H_07_Vo",
                pathId: "4746829665091620903",
              },
              prefabId: 3_350_382_264,
            },
          ],
          waterPrefabId: 1_246_497_777,
        },
      ],
      terrainTiles: [
        { block: "00/00945879.blk", name: "BigWorldTerrain_1_-1.bin" },
        { block: "00/00945879.blk", name: "BigWorldTerrain_1_-2.bin" },
        { block: "00/00945879.blk", name: "BigWorldTerrain_2_-2.bin" },
        { block: "00/13138169.blk", name: "BigWorldTerrain_2_-1.bin" },
      ],
    },
  },
};
