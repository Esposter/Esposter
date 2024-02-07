import { type AttackId } from "@/models/dungeons/attack/AttackId";

export const useAttackManagerStore = defineStore("dungeons/battle/attackManager", () => {
  const attackId = ref<AttackId>();
  const isToEnemy = ref<boolean>();
  const isActive = ref(false);
  const onComplete = ref<() => void>();
  return {
    attackId,
    isToEnemy,
    isActive,
    onComplete,
  };
});
