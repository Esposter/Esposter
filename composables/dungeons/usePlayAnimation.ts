import { type SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type SetupContext } from "vue";

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

    playAnimationKey.value = undefined;
    emit("complete");
  });

  return playAnimationKey;
};
