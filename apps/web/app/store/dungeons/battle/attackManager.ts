import type { Attack } from "#shared/models/dungeons/attack/Attack";
import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useSettingsStore } from "@/store/dungeons/settings";
import { getResultAsync, noop } from "@esposter/shared";
import { sleepScene } from "vue-phaserjs";

export const useAttackManagerStore = defineStore("dungeons/battle/attackManager", () => {
  const settingsStore = useSettingsStore();
  const attackId = ref<AttackId>();
  const isToEnemy = ref<boolean>();
  const isActive = ref(false);
  // The animation is rendered by a singleton manager component, so the turn that starts one is not the thing
  // That learns it finished — the manager's `complete` event is. The resolver waits here for that event and
  // Never leaves this closure: a module-level holder would be shared by every Pinia instance, and exporting it
  // Puts the clearing and the calling at whichever component happens to emit.
  let onComplete: (() => void) | undefined;

  const playAttack = async (scene: SceneWithPlugins, attack: Attack, isAttackToEnemy: boolean) => {
    if (settingsStore.isSkipAnimations) return;

    await new Promise<void>(
      getSynchronizedFunction(async (resolve) => {
        onComplete = resolve;
        attackId.value = attack.id;
        isToEnemy.value = isAttackToEnemy;
        isActive.value = true;
        // The gate the battle turn waits on, so a failed animation resolves it rather than stalling the turn
        await getResultAsync(async () => {
          await sleepScene(scene, 200);
          getDungeonsSoundEffect(scene, attack.fileKey).play();
        }).match(noop, (error) => {
          console.error(error);
          resolve();
        });
      }),
    );
  };
  // `isActive` is the animation component's own `v-model`, so it clears itself
  const completeAttack = () => {
    attackId.value = undefined;
    isToEnemy.value = undefined;
    const resolve = onComplete;
    onComplete = undefined;
    resolve?.();
  };
  return { attackId, completeAttack, isActive, isToEnemy, playAttack };
});
