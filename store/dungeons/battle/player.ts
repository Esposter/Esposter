import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { Grid } from "@/models/dungeons/Grid";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import type { Monster } from "@/models/dungeons/battle/monster/Monster";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { getAttack } from "@/services/dungeons/battle/attack/getAttack";
import { PlayerOptionGrid } from "@/services/dungeons/battle/menu/PlayerOptionGrid";
import type { Position } from "grid-engine";

export const usePlayerStore = defineStore("dungeons/battle/player", () => {
  const activeMonster = ref<Monster>({
    name: ImageKey.Iguanignite,
    asset: {
      key: ImageKey.Iguanignite,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.Slash],
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
