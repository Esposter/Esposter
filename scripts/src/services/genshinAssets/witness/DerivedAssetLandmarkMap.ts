import type { Landmark } from "#src/models/genshinAssets/witness/Landmark";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// Each component's landmarks are kept by name: the points of its parts that `pose` solves a reference's camera from.
// The reference names the pixels it sees each of them at.
export const DerivedAssetLandmarkMap: Record<DerivedAssetComponent, Record<string, Landmark>> = {
  [DerivedAssetComponent.Animals]: {},
  // Each sub-area with a catalogued extent has no landmark of its own: its place is its outline's centre
  [DerivedAssetComponent.ArdraviValley]: {},
  [DerivedAssetComponent.AshavanRealm]: {},
  [DerivedAssetComponent.AshveilPeak]: {},
  [DerivedAssetComponent.Atocpan]: {},
  [DerivedAssetComponent.AvidyaForest]: {},
  [DerivedAssetComponent.BasinOfUnnumberedFlames]: {},
  [DerivedAssetComponent.BelleauRegion]: {},
  [DerivedAssetComponent.BerylRegion]: {},
  [DerivedAssetComponent.BishuiPlain]: {},
  [DerivedAssetComponent.BrightcrownMountains]: {},
  [DerivedAssetComponent.Character]: {},
  [DerivedAssetComponent.ChenyuValeSouthernMountain]: {},
  [DerivedAssetComponent.ChenyuValeUpperVale]: {},
  [DerivedAssetComponent.CoatepecMountain]: {},
  [DerivedAssetComponent.CourtOfFontaineRegion]: {},
  [DerivedAssetComponent.DesertOfHadramaveth]: {},
  [DerivedAssetComponent.Dragonspine]: {},
  [DerivedAssetComponent.EasybreezeHolidayResort]: {},
  [DerivedAssetComponent.ErinnyesForest]: {},
  [DerivedAssetComponent.EverfrozenEarth]: {},
  [DerivedAssetComponent.Fishing]: {},
  // The Court of Fontaine's six landmarks (ParityReferenceMap's court-of-fontaine-location) are all dropped.
  // They are the arch's feet, the bridge's springs and the drum tower's roof corners.
  // The re-extraction exports no arch or bridge mesh near the Court.
  // Its tall Talou towers (Area_Fd_Build_FDC_Talou_A_01_Lod0, 85 metres) stand on several instances.
  // Without the pose there is no way to tell which is the reference's drum tower.
  // The pose cannot run here, since there is no parity page on localhost:3011.
  [DerivedAssetComponent.Fontaine]: {},
  [DerivedAssetComponent.FontaineResearchInstituteOfKineticEnergyEngineeringRegion]: {},
  [DerivedAssetComponent.GalesongHill]: {},
  [DerivedAssetComponent.GavirehLajavard]: {},
  [DerivedAssetComponent.HiisiIsland]: {},
  [DerivedAssetComponent.Hud]: {},
  [DerivedAssetComponent.HypostyleDesert]: {},
  // Inazuma City's four keep landmarks are named: the top tier's eaves and the ledge under them.
  // Their silhouette edges are on Area_Dq_Build_MS_Tsg_03_Lod0, the keep's tallest mesh, with its top at 176.5 metres.
  // They are also on Area_Dq_Build_MS_Tsg_02_Lod0, its second tier.
  // Each is the one standing nearest the keep at (-5260, 150, 3320).
  // The platform's corners, the pavilion's eaves and the houses' base and roof are dropped.
  // No mesh near the capital is matched to them with confidence.
  // The house at the keep's base (Area_Dq_Build_MS_TsgHouse_07_Lod0) is a guess, not read off the image.
  // Solved on these four alone, the camera pass misses its gate (72.40 px against 2, on 19 November).
  // So the seven the reference also names wait on their shares.
  // Those need a camera that tells the city's buildings apart.
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
  [DerivedAssetComponent.Kannazuka]: {},
  [DerivedAssetComponent.LandOfLowerSetekh]: {},
  [DerivedAssetComponent.LandOfUpperSetekh]: {},
  [DerivedAssetComponent.LempoIsle]: {},
  [DerivedAssetComponent.LiffeyRegion]: {},
  [DerivedAssetComponent.Lisha]: {},
  // Liyue Harbor's six landmarks (ParityReferenceMap's liyue-harbor-location) name no mesh.
  // They are the gate's and the tower's plinths.
  // So all six are dropped.
  // The extraction holds nothing rigid within 140 metres of the harbour's anchor.
  // Its nearest floor plate (Plot_05, 1.7 metres across) is 142 metres off, and its pillars 218 metres.
  // Its layout dumps name stairs and boards (Area_Ly_Build_LYG_MT_Stairs_02) that no OBJ exports.
  // So a re-extraction is the way to name them.
  [DerivedAssetComponent.Liyue]: {},
  // The door's dais at its two front feet, and its arch's apex, halfway through its depth.
  // The walkway's two wings by the door's end, and the near pair before them.
  // They sit at the top of their outer faces' front and back ends.
  // The camera is looking along +z as ModelCamera turns.
  // The crowned column behind the door's right at its top, and the lantern tower's two silhouette edges.
  // Both sit at the height the door frame's row 460 crosses.
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
    // The far wings' outer faces stand where they settle, while their tops may still be rising.
    // So only their distance across counts.
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
  [DerivedAssetComponent.LokapalaJungle]: {},
  [DerivedAssetComponent.LostNursery]: {},
  [DerivedAssetComponent.Minlin]: {},
  // Mondstadt's six landmarks (ParityReferenceMap's mondstadt-city-location) are unnamed.
  // They are the towers' and the gate tower's parapets.
  // The extraction exports the city's candidate meshes.
  // Those are Area_MdBuild_Tower01_Lod0 and Area_MdBuild_Tower02_Lod0 for the towers.
  // Area_MdBuild_Gate02_Lod0 is the gate tower, and Stages_Build_BeaconTower01 stands beside them.
  // But which instance is which landmark needs the camera the pose solves.
  // So the map stays empty until that pose runs on the parity page.
  [DerivedAssetComponent.Mondstadt]: {},
  [DerivedAssetComponent.MorteRegion]: {},
  [DerivedAssetComponent.MtLaixin]: {},
  [DerivedAssetComponent.NarukamiIsland]: {},
  // The People of the Springs' seven landmarks (ParityReferenceMap's people-of-the-springs-location) name no mesh.
  // They are the spire and the hall, a terrace stair and the walkway post.
  // All seven are dropped, since the extraction draws the capital as water, planes and terrain tiles alone.
  // Its layout dumps name sentry posts that no OBJ exports.
  [DerivedAssetComponent.Natlan]: {},
  // Nasha Town's seven landmarks (ParityReferenceMap's nasha-town-location) are all dropped.
  // They are the central tower's plinth, ledge struts, collar and column edges.
  // The re-extraction exports 156 buildings.
  // But the tower the reference shows is a pink copper stack on its plinth, with pods and pipes.
  // The nearest candidates, Area_Ndkl_Build_NXZ_Shanghui_01 or _02, are halls 45 and 66 metres high.
  // Neither matches it with confidence.
  // The pose cannot run here, since there is no parity page on localhost:3011.
  [DerivedAssetComponent.NodKrai]: {},
  [DerivedAssetComponent.NostoiRegion]: {},
  [DerivedAssetComponent.Ochkanatlan]: {},
  [DerivedAssetComponent.PahaIsle]: {},
  [DerivedAssetComponent.PlayerGirl]: {},
  [DerivedAssetComponent.Props]: {},
  [DerivedAssetComponent.QiongjiEstuary]: {},
  [DerivedAssetComponent.QuahuacanCliff]: {},
  [DerivedAssetComponent.RealmOfFarakhkert]: {},
  [DerivedAssetComponent.SeaOfClouds]: {},
  [DerivedAssetComponent.SeiraiIsland]: {},
  // Snezhnograd's seven landmarks (ParityReferenceMap's everfrozen-earth-location: its spires and towers) name no mesh.
  // So all seven are dropped.
  // The extraction holds five house pieces and three stair pieces 128 to 148 metres off the capital.
  // None is a spire or tower.
  // Its layout dumps name sentry posts that no OBJ exports.
  [DerivedAssetComponent.Snezhnaya]: {},
  [DerivedAssetComponent.StarfellValley]: {},
  // Sumeru City's nine landmarks are named (ParityReferenceMap's sumeru-city-location).
  // They are the terrace spire's base, tip and wings, and the harbour minaret's collar, dome and finial.
  // The spire is the slender Area_Xm_Build_XKC_Shendian_04_Lod0 at the plateau's top, its tip at 190.8 to 216.5 metres.
  // That mesh gives the tip and wings.
  // Area_Xm_Build_XKC_Shendian_03_Lod0 under it gives the base's left edge.
  // All of them stand at (-2253, 191, -4144).
  // The minaret is Area_Xm_Build_XKC_Talou_01_Lod0, the one tower among the harbour's piers.
  // Its profile is the reference's.
  // It is an octagonal plinth to 14 metres of its 40, then its top ledge as the collar, a shaft, and an onion dome.
  // The dome is widest at 34 metres, with a finial to its top.
  // The collar and the dome stand 74 and 47 pixels across in the reference, 1.57 to one.
  // The plinth's 11.9 metres and the dome's 7.5 are 1.59.
  // The pose has not run, since there is no parity page on localhost:3011.
  // So these nine are unmeasured.
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
  [DerivedAssetComponent.TequemecanValley]: {},
  [DerivedAssetComponent.TezcatepetoncoRange]: {},
  [DerivedAssetComponent.TheChasm]: {},
  [DerivedAssetComponent.ToyacSprings]: {},
  [DerivedAssetComponent.Traveler]: {},
  [DerivedAssetComponent.TsurumiIsland]: {},
  [DerivedAssetComponent.Vanarana]: {},
  [DerivedAssetComponent.VissudhaField]: {},
  [DerivedAssetComponent.VoidseaOutlook]: {},
  [DerivedAssetComponent.WatatsumiIsland]: {},
  [DerivedAssetComponent.WavechaserPlain]: {},
  [DerivedAssetComponent.Weapons]: {},
  [DerivedAssetComponent.WindrestPeak]: {},
  // Rigid architecture only, never decoration: the statue's own meshes.
  // On the statue's axis, which a round part holds from any heading, are its dish's centre and its figure's top.
  // The two ends of the dish's brim, and the face centres of its widest ring, are the next points.
  // The two outermost vertices of the plinth's rim are read off the rim's band of vertices.
  // They sit where the reference's rim ends.
  // A round plinth has no bounding-box corner or face centre on its rim.
  [DerivedAssetComponent.Windrise]: {
    dishBrimLeft: { isEdge: true, mesh: "Stages_MdGoddess01_Level4AllExtra_Lod0", share: [0.5, 0.445, 1] },
    dishBrimRight: { isEdge: true, mesh: "Stages_MdGoddess01_Level4AllExtra_Lod0", share: [0.5, 0.445, 0] },
    plinthRimLeft: { mesh: "Stages_MdGoddess01_Base_Lod0", share: [0.339, 0.279, 0.879] },
    plinthRimRight: { mesh: "Stages_MdGoddess01_Base_Lod0", share: [0.514, 0.279, 0.121] },
    statueDish: { isInterior: true, mesh: "Stages_MdGoddess01_Level4AllExtra_Lod0", share: [0.5, 0.37, 0.5] },
    statueTop: { mesh: "Stages_MdGoddess_Lite01_Lod0", share: [0.5, 1, 0.5] },
    // The oak's trunk stands upright over its root, our origin, from two metres up to six.
    // So a point four metres up its axis is pinned across between its two silhouettes, whatever its height.
    trunkAxis: { isEdge: true, mesh: "Stages_Unique_CyTree01_Bark_Lod1", share: [0.5383, 0.2095, 0.603] },
  },
  [DerivedAssetComponent.WindwailHighland]: {},
  [DerivedAssetComponent.YashioriIsland]: {},
};
