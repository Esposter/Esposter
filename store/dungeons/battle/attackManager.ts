import type { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";

export const useAttackManagerStore = defineStore("dungeons/battle/attackManager", () => {
  const attackId = ref<AttackKey>();
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
