import type { Attack } from "#shared/models/dungeons/attack/Attack";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { ExternalAttackManagerStore, useAttackManagerStore } from "@/store/dungeons/battle/attackManager";
import { useSettingsStore } from "@/store/dungeons/settings";
import { getResultAsync, noop } from "@esposter/shared";
import { sleep } from "vue-phaserjs";

export const useAttackAnimation = (scene: SceneWithPlugins, attack: Attack, isToEnemy: boolean) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) return undefined;

  const attackManagerStore = useAttackManagerStore();
  const storeRefs = storeToRefs(attackManagerStore);
  return new Promise<void>(
    getSynchronizedFunction(async (resolve) => {
      ExternalAttackManagerStore.onComplete = resolve;
      storeRefs.attackId.value = attack.id;
      storeRefs.isToEnemy.value = isToEnemy;
      storeRefs.isActive.value = true;
      // The gate the battle turn waits on, so a failed animation resolves it rather than stalling the turn
      await getResultAsync(async () => {
        await sleep(scene, 200);
        getDungeonsSoundEffect(scene, attack.soundEffectKey).play();
      }).match(noop, (error) => {
        console.error(error);
        resolve();
      });
    }),
  );
};
