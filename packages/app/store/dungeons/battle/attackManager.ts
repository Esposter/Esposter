import type { AttackId } from "@/models/dungeons/attack/AttackId";

export const ExternalAttackManagerStore = {
  onComplete: undefined as (() => void) | undefined,
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
