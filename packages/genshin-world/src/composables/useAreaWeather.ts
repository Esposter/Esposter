import type { Vector3 } from "three";

import { REGION_RECHECK_DISTANCE } from "#src/services/constants";
import { catalogue } from "#src/services/world/catalogue";
import { useLoop, useTres } from "@tresjs/core";
import { computeOutlineDistance, WeatherKind } from "genshin-engine";

// The weather of the area the camera stands in, its own first one, as the game draws only the weather where the
// Player stands, and clear where no drawn outline holds the camera. It is rechecked only once the camera has moved a
// Stretch, as region data's reach is
export const useAreaWeather = (origin: Vector3) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const areaWeather = shallowRef(WeatherKind.Clear);
  let checkedX = Infinity;
  let checkedZ = Infinity;

  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    const x = activeCamera.position.x + origin.x;
    const z = activeCamera.position.z + origin.z;
    if (Math.hypot(x - checkedX, z - checkedZ) < REGION_RECHECK_DISTANCE) return;
    checkedX = x;
    checkedZ = z;
    const area = catalogue.regions
      .flatMap(({ areas }) => areas)
      .find(({ outline }) => computeOutlineDistance(outline, x, z) === 0);
    areaWeather.value = area?.weathers[0] ?? WeatherKind.Clear;
  });

  return areaWeather;
};
