import type { Landmark } from "#src/models/genshinAssets/witness/Landmark";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// Each component's landmarks by name, the points of its parts `pose` solves a reference's camera from where the
// Reference names the pixels it sees them at
export const DerivedAssetLandmarkMap: Record<DerivedAssetComponent, Record<string, Landmark>> = {
  // The Court of Fontaine's six landmarks (ParityReferenceMap's court-of-fontaine-location: the arch's feet, the bridge's
  // Springs and the drum tower's roof corners) are all dropped: the re-extraction exports no arch or bridge mesh near the
  // Court, and its tall Talou towers (Area_Fd_Build_FDC_Talou_A_01_Lod0, 85 metres) stand on several instances with no
  // Way to tell which is the reference's drum tower without the pose, which cannot run here (no parity page on
  // Localhost:3011)
  [DerivedAssetComponent.Fontaine]: {},
  [DerivedAssetComponent.Hud]: {},
  // Inazuma City's four keep landmarks named: the top tier's eaves and the ledge under them, the silhouette edges of
  // Area_Dq_Build_MS_Tsg_03_Lod0 (the keep's tallest mesh, its top at 176.5 metres) and Area_Dq_Build_MS_Tsg_02_Lod0
  // (its second tier), each the one standing nearest the keep at (-5260, 150, 3320). The platform's corners, the
  // Pavilion's eaves and the houses' base and roof are dropped: no mesh near the capital is matched to them with
  // Confidence, and the house at the keep's base (Area_Dq_Build_MS_TsgHouse_07_Lod0) is a guess not read off the image.
  // The pose could not run here (no parity page on localhost:3011), so these four are unmeasured
  [DerivedAssetComponent.Inazuma]: {
    keepEaveLeft: {
      isEdge: true,
      mesh: "Area_Dq_Build_MS_Tsg_03_Lod0",
      near: [-5269.3, 160.95, 3314.84],
      share: [0, 1, 0.5],
    },
    keepEaveRight: {
      isEdge: true,
      mesh: "Area_Dq_Build_MS_Tsg_03_Lod0",
      near: [-5269.3, 160.95, 3314.84],
      share: [1, 1, 0.5],
    },
    keepLedgeLeft: {
      isEdge: true,
      mesh: "Area_Dq_Build_MS_Tsg_02_Lod0",
      near: [-5264.48, 139.57, 3320.95],
      share: [0, 1, 0.5],
    },
    keepLedgeRight: {
      isEdge: true,
      mesh: "Area_Dq_Build_MS_Tsg_02_Lod0",
      near: [-5264.48, 139.57, 3320.95],
      share: [1, 1, 0.5],
    },
  },
  // Liyue Harbor's six landmarks (ParityReferenceMap's liyue-harbor-location: the gate's and the tower's plinths) name
  // No mesh, so all six are dropped: the extraction holds nothing rigid within 140 metres of the harbour's anchor, its
  // Nearest floor plate (Plot_05, 1.7 metres across) 142 metres off and its pillars 218 metres; its layout dumps name
  // Stairs and boards (Area_Ly_Build_LYG_MT_Stairs_02) that no OBJ exports, so a re-extraction is the way to name them
  [DerivedAssetComponent.Liyue]: {},
  // The door's dais at its two front feet, and its arch's apex, halfway through its depth; the walkway's two wings by
  // The door's end and the near pair before them, at the top of their outer faces' front and back ends, the camera
  // Looking along +z as ModelCamera turns; the crowned column behind the door's right at its top, and the lantern
  // Tower's two silhouette edges at the height the door frame's row 460 crosses it
  [DerivedAssetComponent.Login]: {
    columnCrown: { mesh: "LoginScene_Build01_01_Lod0", near: [-5, -25.7, 60.2], share: [0.5, 1, 0.5] },
    doorApex: { mesh: "LoginScene_Door01_Vo", share: [0.5, 1, 0.5] },
    doorFootLeft: { mesh: "LoginScene_Door01_Vo", share: [1, 0, 0] },
    doorFootRight: { mesh: "LoginScene_Door01_Vo", share: [0, 0, 0] },
    towerRightInner: {
      isEdge: true,
      mesh: "LoginScene_Build04_01_Lod0",
      near: [-15.8, -56.5, 36],
      share: [1, 0.72, 0.5],
    },
    towerRightOuter: {
      isEdge: true,
      mesh: "LoginScene_Build04_01_Lod0",
      near: [-15.8, -56.5, 36],
      share: [0, 0.72, 0.5],
    },
    // The far wings' outer faces, standing where they settle while their tops may still be rising, so only their
    // Distance across counts
    wingFarLeftEdge: { isEdge: true, mesh: "LoginScene_Bridge01_19_Vo", share: [1, 1, 0.5] },
    wingFarRightEdge: { isEdge: true, mesh: "LoginScene_Bridge01_20_Vo", share: [0, 1, 0.5] },
    wingLeftBack: { mesh: "LoginScene_Bridge01_19_Vo", share: [1, 1, 0.858] },
    wingLeftFront: { mesh: "LoginScene_Bridge01_19_Vo", share: [1, 1, 0.595] },
    wingNearLeftBack: { mesh: "LoginScene_Bridge01_06_Vo", share: [1, 1, 0.771] },
    wingNearLeftFront: { mesh: "LoginScene_Bridge01_06_Vo", share: [1, 1, 0.188] },
    wingNearRightBack: { mesh: "LoginScene_Bridge01_08_Vo", share: [0, 1, 0.803] },
    wingNearRightFront: { mesh: "LoginScene_Bridge01_08_Vo", share: [0, 1, 0.428] },
    wingRightBack: { mesh: "LoginScene_Bridge01_20_Vo", share: [0, 1, 0.8125] },
    wingRightFront: { mesh: "LoginScene_Bridge01_20_Vo", share: [0, 1, 0.351] },
  },
  // Mondstadt's six landmarks (ParityReferenceMap's mondstadt-city-location: the towers' and the gate tower's parapets)
  // Are unnamed: the extraction exports the city's candidate meshes (Area_MdBuild_Tower01_Lod0 and Area_MdBuild_Tower02_Lod0
  // For the towers, Area_MdBuild_Gate02_Lod0 for the gate tower, Stages_Build_BeaconTower01 beside them), but which instance
  // Is which landmark needs the camera the pose solves, so the map stays empty until that pose runs on the parity page
  [DerivedAssetComponent.Mondstadt]: {},
  // The People of the Springs' seven landmarks (ParityReferenceMap's people-of-the-springs-location: the spire and the
  // Hall, a terrace stair and the walkway post) name no mesh, all seven dropped: the extraction draws the capital
  // As water, planes and terrain tiles alone, and its layout dumps name sentry posts that no OBJ exports
  [DerivedAssetComponent.Natlan]: {},
  // Nasha Town's seven landmarks (ParityReferenceMap's nasha-town-location: the central tower's plinth, ledge struts,
  // Collar and column edges) are all dropped: the re-extraction exports 156 buildings, but the tower the reference shows
  // Is a pink copper stack on its plinth with pods and pipes, and no exported mesh (Area_Ndkl_Build_NXZ_Shanghui_01 or
  // _02, the tallest near the town, are halls 45 and 66 metres high) matches it with confidence; the pose cannot run
  // Here (no parity page on localhost:3011)
  [DerivedAssetComponent.NodKrai]: {},
  [DerivedAssetComponent.PlayerGirl]: {},
  // Snezhnograd's seven landmarks (ParityReferenceMap's everfrozen-earth-location: its spires and towers) name no mesh,
  // So all seven are dropped: the extraction holds five house pieces and three stair pieces 128 to 148 metres off the
  // Capital, none a spire or tower, and its layout dumps name sentry posts that no OBJ exports
  [DerivedAssetComponent.Snezhnaya]: {},
  // Sumeru City's nine landmarks named (ParityReferenceMap's sumeru-city-location: the terrace spire's base, tip and
  // Wings, and the harbour minaret's collar, dome and finial). The spire is the slender
  // Area_Xm_Build_XKC_Shendian_04_Lod0 at the plateau's top (its tip 190.8 to 216.5 metres) for the tip and wings, and
  // Area_Xm_Build_XKC_Shendian_03_Lod0 under it for the base's left edge, all standing at (-2253, 191, -4144). The
  // Minaret is Area_Xm_Build_XKC_Talou_01_Lod0, the one tower among the harbour's piers, whose profile is the
  // Reference's: an octagonal plinth to 14 metres of its 40, its top ledge the collar, a shaft, then an onion dome
  // Widest at 34 metres and a finial to its top. The collar and the dome stand 74 and 47 pixels across in the
  // Reference, 1.57 to one, and the plinth's 11.9 metres and the dome's 7.5 are 1.59. The pose has not run (no parity
  // Page on localhost:3011), so these nine are unmeasured
  [DerivedAssetComponent.Sumeru]: {
    minaretCollarLeft: {
      isEdge: true,
      mesh: "Area_Xm_Build_XKC_Talou_01_Lod0",
      near: [-2399.59, 9.73, -4101.32],
      share: [0, 0.35, 0.5],
    },
    minaretCollarRight: {
      isEdge: true,
      mesh: "Area_Xm_Build_XKC_Talou_01_Lod0",
      near: [-2399.59, 9.73, -4101.32],
      share: [1, 0.35, 0.5],
    },
    minaretDomeLeft: {
      isEdge: true,
      mesh: "Area_Xm_Build_XKC_Talou_01_Lod0",
      near: [-2399.59, 9.73, -4101.32],
      share: [0, 0.85, 0.5],
    },
    minaretDomeRight: {
      isEdge: true,
      mesh: "Area_Xm_Build_XKC_Talou_01_Lod0",
      near: [-2399.59, 9.73, -4101.32],
      share: [1, 0.85, 0.5],
    },
    minaretFinial: {
      isInterior: true,
      mesh: "Area_Xm_Build_XKC_Talou_01_Lod0",
      near: [-2399.59, 9.73, -4101.32],
      share: [0.5, 1, 0.5],
    },
    spireBaseLeft: {
      isEdge: true,
      mesh: "Area_Xm_Build_XKC_Shendian_03_Lod0",
      near: [-2252.81, 190.83, -4144.23],
      share: [0, 0.5, 0.5],
    },
    spireTip: {
      isInterior: true,
      mesh: "Area_Xm_Build_XKC_Shendian_04_Lod0",
      near: [-2252.81, 190.83, -4144.23],
      share: [0.5, 1, 0.5],
    },
    spireWingLeft: {
      isEdge: true,
      mesh: "Area_Xm_Build_XKC_Shendian_04_Lod0",
      near: [-2252.81, 190.83, -4144.23],
      share: [0, 0.85, 0.5],
    },
    spireWingRight: {
      isEdge: true,
      mesh: "Area_Xm_Build_XKC_Shendian_04_Lod0",
      near: [-2252.81, 190.83, -4144.23],
      share: [1, 0.85, 0.5],
    },
  },
  [DerivedAssetComponent.Traveler]: {},
  // Rigid architecture only, never decoration: the statue's own meshes. Points on the statue's axis, which a round part
  // Holds from any heading: the centre of its dish and the top of its figure; the two ends of the dish's brim, the face
  // Centres of its widest ring; and the two outermost vertices of the plinth's rim, read off the rim's band of vertices
  // Where the reference's rim ends, since a round plinth has no bounding-box corner or face centre on its rim
  [DerivedAssetComponent.Windrise]: {
    dishBrimLeft: { isEdge: true, mesh: "Stages_MdGoddess01_Level4AllExtra_Lod0", share: [0.5, 0.445, 1] },
    dishBrimRight: { isEdge: true, mesh: "Stages_MdGoddess01_Level4AllExtra_Lod0", share: [0.5, 0.445, 0] },
    plinthRimLeft: { mesh: "Stages_MdGoddess01_Base_Lod0", share: [0.339, 0.279, 0.879] },
    plinthRimRight: { mesh: "Stages_MdGoddess01_Base_Lod0", share: [0.514, 0.279, 0.121] },
    statueDish: { isInterior: true, mesh: "Stages_MdGoddess01_Level4AllExtra_Lod0", share: [0.5, 0.37, 0.5] },
    statueTop: { mesh: "Stages_MdGoddess_Lite01_Lod0", share: [0.5, 1, 0.5] },
    // The oak's trunk stands upright over its root, our origin, from two metres up to six, so a point four metres up
    // Its axis is pinned across between its two silhouettes whatever its height
    trunkAxis: { isEdge: true, mesh: "Stages_Unique_CyTree01_Bark_Lod1", share: [0.5383, 0.2095, 0.603] },
  },
};
