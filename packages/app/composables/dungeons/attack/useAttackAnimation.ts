import type { Attack } from "@/models/dungeons/attack/Attack";
import type { SceneWithPlugins } from "vue-phaserjs";

import { dayjs } from "@/services/dayjs";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { ExternalAttackManagerStore, useAttackManagerStore } from "@/store/dungeons/battle/attackManager";
import { useSettingsStore } from "@/store/dungeons/settings";
import { getSync } from "@/util/getSync";
import { sleep } from "vue-phaserjs";

export const useAttackAnimation = async (scene: SceneWithPlugins, attack: Attack, isToEnemy: boolean) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) return;

  const attackManagerStore = useAttackManagerStore();
  const storeRefs = storeToRefs(attackManagerStore);
  return new Promise<void>((resolve) =>
    getSync(async () => {
      ExternalAttackManagerStore.onComplete = resolve;
      storeRefs.attackId.value = attack.id;
      storeRefs.isToEnemy.value = isToEnemy;
      storeRefs.isActive.value = true;
      await sleep(scene, dayjs.duration(0.2, "seconds").asMilliseconds());
      getDungeonsSoundEffect(scene, attack.soundEffectKey).play();
    }),
  );
};
