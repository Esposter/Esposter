import type { Landmark } from "#src/models/genshinAssets/witness/Landmark";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// Each component's landmarks by name, the points of its parts `pose` solves a reference's camera from where the
// Reference names the pixels it sees them at
export const DerivedAssetLandmarkMap: Record<DerivedAssetComponent, Record<string, Landmark>> = {
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
  // The Court's landmarks name its capital's meshes and their shares, which the extraction has not yet given
  [DerivedAssetComponent.Fontaine]: {},
  // Inazuma City's landmarks name its capital's rigid meshes and their shares, which the extraction has not yet given:
  // The keep's eaves and ledges, the platform's corners, the houses' bases and roofs and the pavilion's eaves, each read
  // By eye off the reference's 4x crops (ParityReferenceMap's inazuma-city-location)
  [DerivedAssetComponent.Inazuma]: {},
  // Liyue Harbor's landmarks name its capital's rigid meshes and their shares, which the extraction has not yet given: the
  // Steps, plinths, walls, gates and towers its reference's 4x crops show (ParityReferenceMap's liyue-harbor-location)
  [DerivedAssetComponent.Liyue]: {},
  // Mondstadt's landmarks name its capital's meshes, which the extraction has not yet given: the six corners its reference
  // Names (ParityReferenceMap's mondstadt-city-location) are the towers' and the gate tower's parapets
  [DerivedAssetComponent.Mondstadt]: {},
  // The People of the Springs' landmarks (ParityReferenceMap's people-of-the-springs-location) name its capital's rigid
  // Meshes and their shares, which the extraction has not yet given
  [DerivedAssetComponent.Natlan]: {},
  // Nasha Town's landmarks name its capital's meshes and their shares, which the extraction has not yet given
  [DerivedAssetComponent.NodKrai]: {},
  // Snezhnograd's landmarks name its capital's meshes, which the extraction has not yet given
  [DerivedAssetComponent.Snezhnaya]: {},
  // Sumeru City's landmarks name its capital's rigid meshes and their shares, which the extraction has not yet given
  [DerivedAssetComponent.Sumeru]: {},
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
