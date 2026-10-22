import { getAttack } from "@/services/dungeons/attack/getAttack";
import { checkIsMonsterFainted } from "@/services/dungeons/monster/checkIsMonsterFainted";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { takeOne } from "@esposter/shared";

export const useBattlePlayerStore = defineStore("dungeons/battle/player", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const getFirstStandingIndex = () =>
    monsterPartySceneStore.monsters.findIndex((monster) => !checkIsMonsterFainted(monster));
  const activeMonsterIndex = ref(getFirstStandingIndex());
  const activeMonster = computed({
    get: () => takeOne(monsterPartySceneStore.monsters, activeMonsterIndex.value),
    set: (newActiveMonster) => {
      monsterPartySceneStore.monsters[activeMonsterIndex.value] = newActiveMonster;
    },
  });
  const switchActiveMonster = (id: string) => {
    activeMonsterIndex.value = monsterPartySceneStore.monsters.findIndex((monster) => monster.id === id);
  };
  // The party can change between battles, so each battle starts from the party as it is now
  const resetActiveMonster = () => {
    activeMonsterIndex.value = getFirstStandingIndex();
  };
  const attacks = computed(() => activeMonster.value.attackIds.map((attackId) => getAttack(attackId)));

  return {
    activeMonster,
    attacks,
    resetActiveMonster,
    switchActiveMonster,
    ...useMonsterPositions({ x: -150, y: 316 }, { x: 1200, y: 318 }),
  };
});
