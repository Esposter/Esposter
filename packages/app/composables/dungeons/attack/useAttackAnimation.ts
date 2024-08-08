import type { Attack } from "@/models/dungeons/attack/Attack";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { OnComplete } from "@/models/shared/OnComplete";

import { dayjs } from "@/services/dayjs";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { ExternalAttackManagerStore, useAttackManagerStore } from "@/store/dungeons/battle/attackManager";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useAttackAnimation = async (
  scene: SceneWithPlugins,
  attack: Attack,
  isToEnemy: boolean,
  onComplete?: OnComplete,
) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  scene.time.delayedCall(dayjs.duration(0.2, "seconds").asMilliseconds(), () => {
    getDungeonsSoundEffect(scene, attack.soundEffectKey).play();
  });

  if (isSkipAnimations.value) {
    await onComplete?.();
    return;
  }

  const attackManagerStore = useAttackManagerStore();
  const refs = storeToRefs(attackManagerStore);
  ExternalAttackManagerStore.onComplete = onComplete;
  refs.attackId.value = attack.id;
  refs.isToEnemy.value = isToEnemy;
  refs.isActive.value = true;
};
