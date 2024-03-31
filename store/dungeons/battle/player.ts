import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { Grid } from "@/models/dungeons/Grid";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { PlayerOptionGrid } from "@/services/dungeons/battle/menu/PlayerOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import type { Position } from "grid-engine";

export const usePlayerStore = defineStore("dungeons/battle/player", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const activeMonsterIndex = ref(0);
  const activeMonster = computed({
    get: () => save.value.player.monsters[activeMonsterIndex.value],
    set: (newActiveMonster) => {
      save.value.player.monsters[activeMonsterIndex.value] = newActiveMonster;
    },
  });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const monsterPosition = ref<Position>({ x: -100, y: 316 });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const monsterInfoContainerPosition = ref<Position>({ x: 1200, y: 318 });
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  const takeDamage = useTakeDamage(false);
  const optionGrid = ref(PlayerOptionGrid);
  const attacks = computed(() => activeMonster.value.attackIds.map((attackId) => getAttack(attackId)));
  const attackOptionGrid = ref() as Ref<
    Grid<Attack | undefined, [[Attack | undefined, Attack | undefined], [Attack | undefined, Attack | undefined]]>
  >;

  watch(
    attacks,
    (newAttacks) => {
      attackOptionGrid.value = new Grid([
        [newAttacks[0], newAttacks[1]],
        [newAttacks[2], newAttacks[3]],
      ]);
    },
    { immediate: true },
  );

  return {
    activeMonster,
    isActiveMonsterFainted,
    monsterPosition,
    monsterTween,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    takeDamage,
    optionGrid,
    attacks,
    attackOptionGrid,
  };
});
