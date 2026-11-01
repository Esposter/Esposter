import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { WorldOculiOptions } from "#src/models/oculus/WorldOculiOptions";

import { OCULUS_MINIMAP_DISTANCE, OCULUS_REGION_ID, OCULUS_TOUCH_RADIUS } from "#src/services/statue/constants";
import { getNearOculusPlaces } from "#src/services/statue/getNearOculusPlaces";
import { readOculusPlaces } from "#src/services/statue/readOculusPlaces";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The Oculi of the region published, read as the world starts. Those not yet found are stood in, a touch within the
// Touch radius finds one, and those near the camera within the minimap's distance are marked on it
export const useWorldOculi = ({ characterBody, foundOculusIds, gameDataBaseUrl, getMapCamera }: WorldOculiOptions) => {
  const oculusPlaces = shallowRef<OculusPlace[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readOculusPlaces(gameDataBaseUrl, `oculi/${OCULUS_REGION_ID}`)).match(
    (places) => {
      oculusPlaces.value = places;
    },
    (error) => {
      console.error(error);
    },
  );
  const unfoundOculusPlaces = computed(() => oculusPlaces.value.filter(({ id }) => !foundOculusIds.value.has(id)));
  const nearOculusPlaces = computed(() =>
    getNearOculusPlaces(oculusPlaces.value, foundOculusIds.value, getMapCamera(), OCULUS_MINIMAP_DISTANCE),
  );
  // The unfound Oculus the body is touching, if it is touching one, which the frame collects
  const findTouchedOculus = () =>
    getNearOculusPlaces(oculusPlaces.value, foundOculusIds.value, characterBody.position, OCULUS_TOUCH_RADIUS)[0];
  return { findTouchedOculus, nearOculusPlaces, oculusPlaces, unfoundOculusPlaces };
};
