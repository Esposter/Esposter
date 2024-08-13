import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { OnComplete } from "@/models/shared/OnComplete";

export const ExternalAttackManagerStore = {
  onComplete: undefined as OnComplete | undefined,
};

export const useAttackManagerStore = defineStore("dungeons/battle/attackManager", () => {
  const attackId = ref<AttackId>();
  const isToEnemy = ref<boolean>();
  const isActive = ref(false);
  return {
    attackId,
    isActive,
    isToEnemy,
  };
});
