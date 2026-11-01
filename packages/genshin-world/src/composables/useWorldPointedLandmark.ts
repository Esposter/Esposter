import type { MapCamera } from "#src/models/map/MapCamera";
import type { Landmark } from "#src/models/world/Landmark";
import type { Ref } from "vue";

import { findPointedLandmark } from "#src/services/map/findPointedLandmark";
import { shallowRef, watch } from "vue";

// The locked jump landmark the HUD points to, re-read as the character moves and as a landmark unlocks, so unlocking the
// One it points to lets the pointer go at once
export const useWorldPointedLandmark = ({
  lockedJumpLandmarks,
  mapCamera,
}: {
  lockedJumpLandmarks: Readonly<Ref<Landmark[]>>;
  mapCamera: Readonly<Ref<MapCamera>>;
}) => {
  const pointedLandmark = shallowRef<Landmark>();
  watch([mapCamera, lockedJumpLandmarks], ([{ x, z }, lockedLandmarks]) => {
    pointedLandmark.value = findPointedLandmark(lockedLandmarks, { x, z }, pointedLandmark.value?.id);
  });
  return { pointedLandmark };
};
