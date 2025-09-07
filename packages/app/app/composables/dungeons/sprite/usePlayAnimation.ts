import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { SetupContext } from "vue";

export const usePlayAnimation = (
  startSpritesheetKey: SpritesheetKey,
  isActive: Ref<boolean>,
  emit: SetupContext<{ complete: [] }>["emit"],
) => {
  const playAnimationKey = ref(isActive.value ? startSpritesheetKey : undefined);

  watch(isActive, (newIsActive) => {
    if (newIsActive) {
      playAnimationKey.value = startSpritesheetKey;
      return;
    }
    // We'll assume here that if we're setting isActive to false,
    // then that means that we've completed our animation
    playAnimationKey.value = undefined;
    emit("complete");
  });

  return playAnimationKey;
};
