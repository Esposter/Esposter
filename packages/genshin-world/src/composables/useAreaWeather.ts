import type { Catalogue } from "#src/models/world/Catalogue";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";
import type { Vector3 } from "three";

import { AREA_WEATHER_CHANGE_SECONDS, REGION_RECHECK_DISTANCE } from "#src/services/constants";
import { takeOne } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import { computeOutlineDistance, WeatherKind } from "genshin-engine";

// The weather of the area the camera stands in, its own first one, as the game draws only the weather where the
// Player stands, and clear where no drawn outline holds the camera. It is rechecked only once the camera has moved a
// Stretch, as region data's reach is. An area with several weathers turns to the next of them in turn each
// AREA_WEATHER_CHANGE_SECONDS, and a special climate with one holds it
export const useAreaWeather = (origin: Vector3, catalogue: Catalogue) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const areaWeather = shallowRef(WeatherKind.Clear);
  let checkedX = Infinity;
  let checkedZ = Infinity;
  let checkedArea: CatalogueArea | undefined;
  let secondsInWeather = 0;

  onBeforeRender(({ delta }) => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    const x = activeCamera.position.x + origin.x;
    const z = activeCamera.position.z + origin.z;
    if (Math.hypot(x - checkedX, z - checkedZ) >= REGION_RECHECK_DISTANCE) {
      checkedX = x;
      checkedZ = z;
      const area = catalogue.regions
        .flatMap(({ areas }) => areas)
        .find(({ outline }) => computeOutlineDistance(outline, x, z) === 0);
      if (area !== checkedArea) {
        checkedArea = area;
        secondsInWeather = 0;
        areaWeather.value = area?.weathers[0] ?? WeatherKind.Clear;
      }
    }

    const weathers = checkedArea?.weathers ?? [];
    if (weathers.length < 2) return;
    secondsInWeather += delta;
    if (secondsInWeather < AREA_WEATHER_CHANGE_SECONDS) return;
    secondsInWeather = 0;
    areaWeather.value = takeOne(weathers, (weathers.indexOf(areaWeather.value) + 1) % weathers.length);
  });

  return areaWeather;
};
