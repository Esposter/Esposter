import { type AttackId } from "@/models/dungeons/attack/AttackId";
import { useAttackManagerStore } from "@/store/dungeons/battle/attackManager";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useAttackAnimation = (attackId: AttackId, isToEnemy: boolean, onComplete?: () => void) => {
  const settingsStore = useSettingsStore();
  const { isSkipBattleAnimations } = storeToRefs(settingsStore);
  if (isSkipBattleAnimations.value) {
    onComplete?.();
    return;
  }

  const attackManagerStore = useAttackManagerStore();
  const refs = storeToRefs(attackManagerStore);
  refs.attackId.value = attackId;
  refs.isToEnemy.value = isToEnemy;
  refs.onComplete.value = onComplete;
  refs.isActive.value = true;
};
