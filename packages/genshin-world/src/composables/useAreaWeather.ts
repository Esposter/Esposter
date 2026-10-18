import type { Catalogue } from "#src/models/world/Catalogue";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";
import type { Vector3 } from "three";

import { AREA_WEATHER_CHANGE_SECONDS, REGION_RECHECK_DISTANCE, WORLD_RANDOM_SEED } from "#src/services/constants";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { checkIsInCity } from "#src/services/world/checkIsInCity";
import { getNextAreaWeather } from "#src/services/world/getNextAreaWeather";
import { useLoop, useTres } from "@tresjs/core";
import { createSeededRandom, WeatherKind } from "genshin-engine";

// The weather of the area the camera stands in, its own first one, as the game draws only the weather where the
// Player stands, and clear where no drawn outline holds the camera or where it stands in one of the area's cities. It
// Is rechecked only once the camera has moved a stretch, as region data's reach is. An area with several weathers turns
// To the next of them in turn each AREA_WEATHER_CHANGE_SECONDS, drawn by the game's chain among them, and a special
// Climate with one holds it. The turn goes on while the camera is in a city, so leaving it finds the area's weather as
// It has turned
export const useAreaWeather = (origin: Vector3, catalogue: Catalogue) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const areaWeather = shallowRef(WeatherKind.Clear);
  const isInCity = shallowRef(false);
  let checkedX = Infinity;
  let checkedZ = Infinity;
  let checkedArea: CatalogueArea | undefined;
  let secondsInWeather = 0;
  const random = createSeededRandom(WORLD_RANDOM_SEED);

  onBeforeRender(({ delta }) => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    const x = activeCamera.position.x + origin.x;
    const z = activeCamera.position.z + origin.z;
    if (Math.hypot(x - checkedX, z - checkedZ) >= REGION_RECHECK_DISTANCE) {
      checkedX = x;
      checkedZ = z;
      const area = findAreaAt(catalogue, x, z);
      isInCity.value = area !== undefined && checkIsInCity(area, x, z);
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
    areaWeather.value = getNextAreaWeather(areaWeather.value, weathers, random);
  });

  return computed(() => (isInCity.value ? WeatherKind.Clear : areaWeather.value));
};
