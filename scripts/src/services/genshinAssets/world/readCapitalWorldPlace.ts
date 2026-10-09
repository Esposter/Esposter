import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPoint } from "genshin-engine";

import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A region's own data as its file holds it: the landmarks its capital is among
interface RegionData {
  landmarks: { id: string; position: GroundPoint }[];
}

// A region's capital's place in the game's axes: its landmark in the region's data, set round the origin the way the
// Region's open world is
export const readCapitalWorldPlace = async (component: DerivedAssetComponent): Promise<GroundPoint> => {
  const capital = RegionCapitalMap[component];
  if (!capital) throw new InvalidOperationError(Operation.Read, component, "has no capital in the region capital map");
  const regionData = parseMachineJson<RegionData>(
    await readFile(join(WORLD_DATA_DIRECTORY, "regions", `${component}.json`), "utf8"),
  );
  const landmark = regionData.landmarks.find(({ id }) => id === capital.landmarkId);
  if (!landmark) throw new InvalidOperationError(Operation.Read, component, `has no landmark ${capital.landmarkId}`);
  return toCapitalWorldPlace(landmark.position, await readWorldOrigin(component));
};
