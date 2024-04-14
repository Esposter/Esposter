import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { Grid } from "@/models/dungeons/Grid";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { PlayerOptionGrid } from "@/services/dungeons/battle/menu/PlayerOptionGrid";
import { usePlayerStore } from "@/store/dungeons/player";
import type { Position } from "grid-engine";

export const useBattlePlayerStore = defineStore("dungeons/battle/player", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const activeMonsterIndex = ref(0);
  const activeMonster = computed({
    get: () => player.value.monsters[activeMonsterIndex.value],
    set: (newActiveMonster) => {
      player.value.monsters[activeMonsterIndex.value] = newActiveMonster;
    },
  });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const initialMonsterPosition: Position = { x: -100, y: 316 };
  const monsterPosition = ref({ ...initialMonsterPosition });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const initialMonsterInfoContainerPosition: Position = { x: 1200, y: 318 };
  const monsterInfoContainerPosition = ref({ ...initialMonsterInfoContainerPosition });
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  const takeDamage = useTakeDamage(false);
  const optionGrid = ref(PlayerOptionGrid);
  const attacks = computed(() => activeMonster.value.attackIds.map(getAttack));
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
    initialMonsterPosition,
    monsterPosition,
    monsterTween,
    initialMonsterInfoContainerPosition,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    takeDamage,
    optionGrid,
    attacks,
    attackOptionGrid,
  };
});
