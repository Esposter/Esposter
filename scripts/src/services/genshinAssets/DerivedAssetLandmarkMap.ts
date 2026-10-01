import type { Landmark } from "#src/models/genshinAssets/Landmark";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

// Each component's landmarks by name, the points of its parts `pose` solves a reference's camera from where the
// Reference names the pixels it sees them at
export const DerivedAssetLandmarkMap: Record<DerivedAssetComponent, Record<string, Landmark>> = {
  // The door's dais at its two front feet, and its arch's apex, halfway through its depth; the walkway's two wings by the door's
  // End at the top of their outer faces' front and back ends, the camera looking along +z as ModelCamera turns
  [DerivedAssetComponent.Login]: {
    doorApex: { mesh: "LoginScene_Door01_Vo", share: [0.5, 1, 0.5] },
    doorFootLeft: { mesh: "LoginScene_Door01_Vo", share: [1, 0, 0] },
    doorFootRight: { mesh: "LoginScene_Door01_Vo", share: [0, 0, 0] },
    wingLeftBack: { mesh: "LoginScene_Bridge01_19_Vo", share: [1, 1, 0.858] },
    wingLeftFront: { mesh: "LoginScene_Bridge01_19_Vo", share: [1, 1, 0.595] },
    wingRightBack: { mesh: "LoginScene_Bridge01_20_Vo", share: [0, 1, 0.8125] },
    wingRightFront: { mesh: "LoginScene_Bridge01_20_Vo", share: [0, 1, 0.351] },
  },
};
