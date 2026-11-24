import type { DerivedAssetComponentOptions } from "#src/models/genshinAssets/shared/DerivedAssetComponentOptions";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import {
  AVATAR_ICON_PREFIX,
  LOGIN_DOOR_MESH,
  SCENE_POINT_CATEGORY,
  SCENE_POINT_FILE,
} from "#src/services/genshinAssets/shared/constants";

// The one definition every capital and sub-area of the open world shares.
// It derives a part from its place, with no root of its own.
const DERIVED_WORLD_OPTIONS: DerivedAssetComponentOptions = { isCapitalWorld: true, screen: "WorldScreen" };

// Each component's roots, which `extract` follows every pointer from.
// The assets no pointer from them reaches are found by the name the game gives them.
// The asset index turns those names into the blocks holding them.
// The login screen's roots are its own scene, `LoginScene`.
// Its other roots are the prefabs its `MonoLoginScene` spawns into the empty anchors under `SceneObj`.
// Those are the towers' `LoginScene_Build_All`, the walkway and the door.
// Its sky is its Enviro package's, named exactly since the sky's names recur across the game.
// Those names are the sky dome, the cloud layer's meshes, and the cloud layer's and three cloud emitters' materials.
// Their particle atlases and density maps are named too, and so is the sky gradient every one of them is coloured by.
// An emitter's renderer exports without the fields that point at them.
// Its interface is `LoginMainPage`, in the block beside its `Ani_LoginMainPage_Waiting` clips.
// Its clips are the page's, the progress bar's, the lift at its end and the door's.
// `Start` and `End`, a name the whole game reuses, are left to its reference.
// Its music is the playlist `genshin:assets music` found over a recording of its title.
// It is two pieces with a rest after each, looping forever.
export const DerivedAssetComponentMap: Record<DerivedAssetComponent, DerivedAssetComponentOptions> = {
  // The animals: their `Animal_` models, fish and pets among them, and the `Ani_Animal_` clips that move them.
  // No pointer roots them, so the asset index's names find them.
  [DerivedAssetComponent.Animals]: { clipPattern: "^Ani_Animal_", namePattern: "^Animal_", screen: "WorldScreen" },
  // Each sub-area with a catalogued extent is a catalogue area the game outlines, derived the way a capital is.
  // It takes its place from the centre of its outline's box (`readDerivedWorldPlace`).
  // Its tiles are the terrain its outline reaches.
  // An area with no outline is no component, so it keeps its region's ground.
  [DerivedAssetComponent.ArdraviValley]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.AshavanRealm]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.AshveilPeak]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Atocpan]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.AvidyaForest]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.BasinOfUnnumberedFlames]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.BelleauRegion]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.BerylRegion]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.BishuiPlain]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.BrightcrownMountains]: DERIVED_WORLD_OPTIONS,
  // The character screen's page is the `AvatarInfoDialogV2` GameObject.
  // It holds the Animator beside "AvatarInfoDescDialog", the details dialog, and "AvatarLevelUpDialog".
  // A tree that names none of the tabs is the wrong page.
  // Its portraits are the textures the character screen's discs take their colour from.
  // So the component exports them by name.
  [DerivedAssetComponent.Character]: {
    interface: { anchorPattern: "^AvatarInfoDialogV2$", root: "AvatarInfoDialogV2" },
    namePattern: `^${AVATAR_ICON_PREFIX}`,
    screen: "CharacterScreen",
  },
  [DerivedAssetComponent.ChenyuValeSouthernMountain]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.ChenyuValeUpperVale]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.CoatepecMountain]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.CourtOfFontaineRegion]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.DesertOfHadramaveth]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Dragonspine]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.EasybreezeHolidayResort]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.ErinnyesForest]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.EverfrozenEarth]: DERIVED_WORLD_OPTIONS,
  // The fishing scene: the rod models and the rod's clips, the float (`Eff_Avatar_Fishing_Cork`) and the cast effect
  // (`SkillObj_Fishing_Cast`), named by the index. Its names are anchored, so no animal's name reaches them
  [DerivedAssetComponent.Fishing]: {
    clipPattern: "^Ani_FishingRod_",
    namePattern: "^(FishingRod_Normal_|Eff_(Ani_)?Avatar_Fishing_(Cork|Cast)|SkillObj_Fishing_Cast)",
    screen: "WorldScreen",
  },
  // A region's open world is derived from its capital's place (`deriveCapitalWorld`).
  // So no region is rooted at its capital's index.
  // Each `Area_<code>_City_Index` is the StreamGen chunk index of the capital's own area blob.
  // It is a MonoBehaviour holding a blob's chunk offsets and no game object.
  // A root that is one walks to nothing, since the closure starts from the layout of game objects.
  // The blob's placements are read beside the tiles its capital's view covers.
  // They are what holds the city's props and buildings, each a prefab rooted by its game object's name.
  [DerivedAssetComponent.Fontaine]: {
    isCapitalWorld: true,
    namePattern: String.raw`^(Area_Fd_Build_FDC_Zhonglou_01|Area_Fd_(Build|Plot)_FDC_POI_Zongzhan_)`,
    screen: "WorldScreen",
  },
  [DerivedAssetComponent.FontaineResearchInstituteOfKineticEnergyEngineeringRegion]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.GalesongHill]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.GavirehLajavard]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.HiisiIsland]: DERIVED_WORLD_OPTIONS,
  // The in-level HUD: its page is the `InLevelMainPage` GameObject, holding the minimap, party and skill buttons.
  // Its anchor is "TeamBtn_MP", an Animator in no other block, since `GrpMainPage` is in four.
  [DerivedAssetComponent.Hud]: {
    clipPattern: "^Ani_InLevelMainPage_",
    interface: { anchorPattern: "^TeamBtn_MP$", root: "InLevelMainPage" },
    screen: "HudScreen",
  },
  [DerivedAssetComponent.HypostyleDesert]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Inazuma]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Kannazuka]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.LandOfLowerSetekh]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.LandOfUpperSetekh]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.LempoIsle]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.LiffeyRegion]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Lisha]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Liyue]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Login]: {
    clipPattern: "^(Ani_LoginMainPage_|Ani_LoginProgressBar_|Ani_Login_Lift$|Ani_LogginScene_Door01_)",
    interface: { anchorPattern: "^Ani_LoginMainPage_Waiting", root: "LoginMainPage" },
    musicPlaylistId: 792932714,
    namePattern:
      "^(Enviro_(Sky_Gradient|Clouds_(Middle_|Top_)?Particle_Atlas|Clouds_(Voronoi|Wispis|Normal)|Cloud_(Layer|Particle|Mid_Particle|Top_Particle)_Mat|Atmosphere_Layer_Mat)$|(Sky|Cloud)_LOD0$)",
    roots: [{ block: "00/11790361.blk", name: "LoginScene", pathId: "-1124867853248233309" }],
    screen: "LoginScreen",
    // These are what MonoLoginScene's raw bytes point at, each into the anchor it names before it.
    // The anchors are named in Login/Scene/Index.reference.ts.
    // The towers and the walkway come with the count and length its record gives them.
    // They are laid along ModelCamera's heading.
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
        // At the flight's end the door stands on the walkway's top, centred on it, at its far end along +z.
        // That far end is 3.1 metres beyond its wings' near faces.
        // The door's pose and the walkway's, on one frame of login-door-recording, measure that.
        // The door's turn is held to the walkway's and the camera's heading, ModelCamera's.
        // The two solves scatter the foot by a few centimetres either side of the top and axis, so it stands on both.
        position: [262, -340.68, -776.1],
        prefab: { block: "00/11790361.blk", name: LOGIN_DOOR_MESH, pathId: "3964741434016489810" },
      },
    ],
  },
  [DerivedAssetComponent.LokapalaJungle]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.LostNursery]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Minlin]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Mondstadt]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.MorteRegion]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.MtLaixin]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.NarukamiIsland]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Natlan]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.NodKrai]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.NostoiRegion]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Ochkanatlan]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.PahaIsle]: DERIVED_WORLD_OPTIONS,
  // Lumine, the player's girl avatar: her model prefab in the character block, rooted at its game object.
  // So `extract` walks her skinned renderers and their materials the way it walks a scene's.
  // No parity screen draws her yet.
  [DerivedAssetComponent.PlayerGirl]: {
    roots: [{ block: "00/02666572.blk", name: "Avatar_Girl_Sword_PlayerGirl_Model", pathId: "7275937277578795946" }],
    screen: "",
  },
  // The props and gadgets the world places.
  // It roots and names no pattern: the asset index has no GameObject rows, so a prefab's name finds nothing there.
  // Each kind's export names the assets of its own prefab.
  [DerivedAssetComponent.Props]: { screen: "WorldScreen" },
  [DerivedAssetComponent.QiongjiEstuary]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.QuahuacanCliff]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.RealmOfFarakhkert]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.SeaOfClouds]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.SeiraiIsland]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Snezhnaya]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.StarfellValley]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Sumeru]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.TequemecanValley]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.TezcatepetoncoRange]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.TheChasm]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.ToyacSprings]: DERIVED_WORLD_OPTIONS,
  // The Traveler's four locomotion clips, the standing, walk, run and sprint cycles of `Ani_Avatar_Girl_`.
  // Standby is an AnimationClip in `00/04161624.blk`.
  // Walk, Run and Sprint are in `00/04523043.blk`, as the asset index names them.
  // The index also names `00/00035183.blk` for the same four, which holds only TextAssets and exports none.
  // Her model is rooted by PlayerGirl's entry, so this one roots nothing.
  [DerivedAssetComponent.Traveler]: {
    clipPattern: "^Ani_Avatar_Girl_(Standby|WalkCycle|RunCycle|SprintCycle)$",
    // Their bones are PlayerGirl's rig, whose avatar names each bone's path (`avatar playergirl`)
    clipSkeleton: DerivedAssetComponent.PlayerGirl,
    screen: "WorldScreen",
  },
  [DerivedAssetComponent.TsurumiIsland]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.Vanarana]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.VissudhaField]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.VoidseaOutlook]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.WatatsumiIsland]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.WavechaserPlain]: DERIVED_WORLD_OPTIONS,
  // The weapons' screen. Its roots are the prefabs whose renderers draw the held weapons' meshes.
  // `weapon-roots` derives them from the layouts of the blocks the asset index puts those meshes in and publishes.
  // So `readComponentRoots` reads them rather than this map.
  // The icons its fit traces are exported by `weapon-icons` from the weapon table.
  [DerivedAssetComponent.Weapons]: { screen: "WeaponScreen" },
  [DerivedAssetComponent.WindrestPeak]: DERIVED_WORLD_OPTIONS,
  // Windrise is the open world's (World/Screen/Index.reference.ts).
  // It takes in the statue's gadget prefab at its scene point.
  // It also takes in the oak's prefab at the one placement of Windrise's own area.
  // It takes in the oak's finest meshes, which no prefab holds.
  // It takes in four terrain tiles under the valley and the slopes north of it, with their base maps.
  // It takes in the windmill's tower and blade meshes, which no dumped layout draws.
  // Its prefab's pointers are null, so only their names reach them.
  [DerivedAssetComponent.Windrise]: {
    namePattern: String.raw`^(Stages_Unique_CyTree01_(Bark|Leaf)_Lod0|BigWorldTerrain_(1|2)_-(1|2)\.bin_BaseMap|Property_Build_Windmill02_(Bottom_Vo|Blade_Lod0))$`,
    screen: "WorldScreen",
    world: {
      // The oak's foot is the origin of our Windrise, as our scene has always stood round it
      origin: { block: "00/16170614.blk", name: "Stages_Unique_CyTree01_Lod1", pathId: "6733514611168788700" },
      points: [
        {
          category: SCENE_POINT_CATEGORY,
          file: SCENE_POINT_FILE,
          id: "4",
          position: "tranPos",
          prefab: { block: "00/04803507.blk", name: "SceneObj_NPC_Goddess", pathId: "1660930449232041872" },
          rotation: "tranRot",
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
        // Of the tile's own placements, Area_Md_Water_Common_01_Vo is the valley's water, named by its path hash.
        // Its other two are the paving stones under the statue's dais steps.
        // A recording's camera is solved by their centres.
        // The dais's steps and the two carved pedestals either side of the statue carry no path hash of their own.
        // So the LOD table names them by their finest level's.
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
            {
              prefab: {
                block: "00/05652564.blk",
                name: "Area_Common_Build_Plinth_E_01_Lod0",
                pathId: "-2383471818772636885",
              },
              prefabId: 2_068_799_372,
            },
            {
              prefab: {
                block: "00/05652564.blk",
                name: "Area_Common_Build_Plinth_E_02_Lod0",
                pathId: "-4253360323365887065",
              },
              prefabId: 2_068_796_237,
            },
            {
              prefab: {
                block: "00/03851813.blk",
                name: "Area_Common_Build_Stair_A_01_Lod0",
                pathId: "-3545738691652725999",
              },
              prefabId: 2_751_255_372,
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
  [DerivedAssetComponent.WindwailHighland]: DERIVED_WORLD_OPTIONS,
  [DerivedAssetComponent.YashioriIsland]: DERIVED_WORLD_OPTIONS,
};
