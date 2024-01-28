import { AttackId } from "@/models/dungeons/attack/AttackId";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type AnimationState } from "~/models/dungeons/battle/monsters/AnimationState";

export const usePlayerStore = defineStore("dungeons/scene/battle/player", () => {
  const activeMonster = ref<Monster>({
    name: TextureManagerKey.Iguanignite,
    asset: {
      key: TextureManagerKey.Iguanignite,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.Slash],
  });
  const animationState = ref<AnimationState | null>(null);
  return { activeMonster, animationState };
});
