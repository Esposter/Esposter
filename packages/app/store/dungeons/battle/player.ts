import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { Position } from "grid-engine";

import { getAttack } from "@/services/dungeons/attack/getAttack";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { usePlayerStore } from "@/store/dungeons/player";

export const useBattlePlayerStore = defineStore("dungeons/battle/player", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const activeMonsterIndex = ref(player.value.monsters.findIndex((m) => !isMonsterFainted(m)));
  const activeMonster = computed({
    get: () => player.value.monsters[activeMonsterIndex.value],
    set: (newActiveMonster) => {
      player.value.monsters[activeMonsterIndex.value] = newActiveMonster;
    },
  });
  const switchActiveMonster = (id: string) => {
    activeMonsterIndex.value = player.value.monsters.findIndex((m) => m.id === id);
  };

  const initialMonsterPosition = Object.freeze<Position>({ x: -150, y: 316 });
  const monsterPosition = ref({ ...initialMonsterPosition });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const initialMonsterInfoContainerPosition = Object.freeze<Position>({ x: 1200, y: 318 });
  const monsterInfoContainerPosition = ref({ ...initialMonsterInfoContainerPosition });
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  const takeDamage = useTakeDamage(false);
  const attacks = computed(() => activeMonster.value.attackIds.map(getAttack));

  return {
    activeMonster,
    attacks,
    initialMonsterInfoContainerPosition,
    initialMonsterPosition,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    monsterPosition,
    monsterTween,
    switchActiveMonster,
    takeDamage,
  };
});
