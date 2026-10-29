import type { Catalogue } from "#src/models/world/Catalogue";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { describe } from "vitest";

// A catalogue of one region and one area, the area's outline a square round the origin, for the dev commands' places
export const DEV_CATALOGUE: Catalogue = {
  regions: [
    {
      areas: [
        {
          id: "windrise",
          layer: WorldLayer.Surface,
          name: "Windrise",
          outline: [
            { x: -100, z: -100 },
            { x: 100, z: -100 },
            { x: 100, z: 100 },
            { x: -100, z: 100 },
          ],
          subareas: [],
          subregion: "",
          weathers: [],
        },
      ],
      id: "mondstadt",
      name: "Mondstadt",
    },
  ],
};

// A statue of the seven in the area above, with the arrival a jump lands at
export const DEV_LANDMARK: StatueLandmark = {
  areaId: "windrise",
  arrival: { heightOffset: 2, position: { x: 30, z: -40 }, rotation: Math.PI / 2 },
  heightOffset: 1,
  id: "windrise-statue",
  kind: LandmarkKind.StatueOfTheSeven,
  position: { x: 0, z: 0 },
  rotation: 0,
};

describe.todo("constants");
