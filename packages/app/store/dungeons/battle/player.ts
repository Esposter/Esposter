import type { Position } from "grid-engine";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

import { getAttack } from "@/services/dungeons/attack/getAttack";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export const useBattlePlayerStore = defineStore("dungeons/battle/player", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const activeMonsterIndex = ref(monsterPartySceneStore.monsters.findIndex((m) => !isMonsterFainted(m)));
  const activeMonster = computed({
    get: () => monsterPartySceneStore.monsters[activeMonsterIndex.value],
    set: (newActiveMonster) => {
      monsterPartySceneStore.monsters[activeMonsterIndex.value] = newActiveMonster;
    },
  });
  const switchActiveMonster = (id: string) => {
    activeMonsterIndex.value = monsterPartySceneStore.monsters.findIndex((m) => m.id === id);
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
    // @TODO: https://github.com/vuejs/pinia/issues/2767
    activeMonster: activeMonster as Ref<typeof activeMonster.value>,
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
