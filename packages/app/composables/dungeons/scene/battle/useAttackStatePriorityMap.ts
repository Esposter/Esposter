import { PlayerOption } from "@/models/dungeons/scene/battle/menu/PlayerOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";

export const useAttackStatePriorityMap = () => {
  const playerStore = useBattlePlayerStore();
  const { optionGrid } = storeToRefs(playerStore);

  if (optionGrid.value.value !== PlayerOption.Fight)
    return {
      [StateName.Battle]: StateName.EnemyAttack,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerInput,
      [StateName.PlayerPostAttackCheck]: null,
    };
  else if (generateRandomBoolean())
    return {
      [StateName.Battle]: StateName.PlayerAttack,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerInput,
      [StateName.PlayerPostAttackCheck]: StateName.EnemyAttack,
    };
  else
    return {
      [StateName.Battle]: StateName.EnemyAttack,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerAttack,
      [StateName.PlayerPostAttackCheck]: StateName.PlayerInput,
    };
};
