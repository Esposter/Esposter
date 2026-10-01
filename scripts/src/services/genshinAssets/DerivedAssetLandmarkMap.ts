import type { Landmark } from "#src/models/genshinAssets/Landmark";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

// Each component's landmarks by name, the points of its parts `pose` solves a reference's camera from where the
// Reference names the pixels it sees them at
export const DerivedAssetLandmarkMap: Record<DerivedAssetComponent, Record<string, Landmark>> = {
  // The door's dais at its two front feet, and its arch's apex, halfway through its depth; the walkway's two wings by the door's
  // End and the near pair before them, at the top of their outer faces' front and back ends, the camera looking along
  // +z as ModelCamera turns
  [DerivedAssetComponent.Login]: {
    columnCrown: { mesh: "LoginScene_Build01_01_Lod0", near: [-5, -25.7, 60.2], share: [0.5, 1, 0.5] },
    doorApex: { mesh: "LoginScene_Door01_Vo", share: [0.5, 1, 0.5] },
      isEdge: true,
      mesh: "LoginScene_Build05_01_Lod0",
      near: [23.8, -28.4, 29.6],
      share: [0, 0.5, 0.5],
    },
      isEdge: true,
      mesh: "LoginScene_Build05_01_Lod0",
      near: [23.8, -28.4, 29.6],
      share: [1, 0.5, 0.5],
    },
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
    doorFootLeft: { mesh: "LoginScene_Door01_Vo", share: [1, 0, 0] },
    doorFootRight: { mesh: "LoginScene_Door01_Vo", share: [0, 0, 0] },
    wingLeftBack: { mesh: "LoginScene_Bridge01_19_Vo", share: [1, 1, 0.858] },
    wingLeftFront: { mesh: "LoginScene_Bridge01_19_Vo", share: [1, 1, 0.595] },
    wingNearLeftBack: { mesh: "LoginScene_Bridge01_06_Vo", share: [1, 1, 0.771] },
    wingNearLeftFront: { mesh: "LoginScene_Bridge01_06_Vo", share: [1, 1, 0.188] },
    wingNearRightBack: { mesh: "LoginScene_Bridge01_08_Vo", share: [0, 1, 0.803] },
    wingNearRightFront: { mesh: "LoginScene_Bridge01_08_Vo", share: [0, 1, 0.428] },
    wingRightBack: { mesh: "LoginScene_Bridge01_20_Vo", share: [0, 1, 0.8125] },
    wingRightFront: { mesh: "LoginScene_Bridge01_20_Vo", share: [0, 1, 0.351] },
  },
};
