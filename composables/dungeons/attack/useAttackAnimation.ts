import type { Attack } from "@/models/dungeons/attack/Attack";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { ExternalAttackManagerStore, useAttackManagerStore } from "@/store/dungeons/battle/attackManager";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useAttackAnimation = (
  scene: SceneWithPlugins,
  attack: Attack,
  isToEnemy: boolean,
  onComplete?: () => void,
) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const { play } = useDungeonsSoundEffect(scene, attack.soundEffectKey);

  scene.time.delayedCall(dayjs.duration(0.2, "seconds").asMilliseconds(), () => {
    play();
  });

  if (isSkipAnimations.value) {
    onComplete?.();
    return;
  }

  const attackManagerStore = useAttackManagerStore();
  const refs = storeToRefs(attackManagerStore);
  ExternalAttackManagerStore.onComplete = onComplete;
  refs.attackId.value = attack.id;
  refs.isToEnemy.value = isToEnemy;
  refs.isActive.value = true;
};
