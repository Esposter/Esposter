import type { ScreenBehaviour } from "#src/models/screen/ScreenBehaviour";
import type { Ref } from "vue";

import { computed, ref } from "vue";

// Whether the backslash has hidden the HUD, as the game's Hide UI does, apart from the screens that hide it, and whether the
// HUD is drawn over the world, which a reference's held camera, a witness render, the pause and the screens that hide it all
// Keep off
export const useWorldHudVisibility = ({
  checkIsCameraHeld,
  checkIsPaused,
  checkIsWitnessed,
  screenBehaviour,
}: {
  checkIsCameraHeld: () => boolean;
  checkIsPaused: () => boolean;
  checkIsWitnessed: () => boolean;
  screenBehaviour: Readonly<Ref<ScreenBehaviour>>;
}) => {
  const isHudHidden = ref(false);
  const isHudShown = computed(
    () =>
      !checkIsCameraHeld() &&
      !checkIsWitnessed() &&
      !checkIsPaused() &&
      !isHudHidden.value &&
      !screenBehaviour.value.isHudHidden,
  );
  return { isHudHidden, isHudShown };
};
