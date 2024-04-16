import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { dayjs } from "@/services/dayjs";
import { useAttackManagerStore } from "@/store/dungeons/battle/attackManager";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useAttackAnimation = (attack: Attack, isToEnemy: boolean, onComplete?: () => void) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const { play } = useDungeonsSoundEffect(attack.soundEffectKey);

  scene.value.time.delayedCall(dayjs.duration(0.2, "seconds").asMilliseconds(), () => {
    play();
  });

  if (isSkipAnimations.value) {
    onComplete?.();
    return;
  }

  const attackManagerStore = useAttackManagerStore();
  const refs = storeToRefs(attackManagerStore);
  refs.attackId.value = attack.id;
  refs.isToEnemy.value = isToEnemy;
  refs.onComplete.value = onComplete;
  refs.isActive.value = true;
};
