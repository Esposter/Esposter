import { PlayerOption } from "@/models/dungeons/battle/menu/PlayerOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const useAttackStatePriorityMap = () => {
  const playerStore = usePlayerStore();
  const { optionGrid } = storeToRefs(playerStore);

  if (optionGrid.value.value !== PlayerOption.Fight)
    return {
      [StateName.Battle]: StateName.EnemyAttack,
      [StateName.PlayerPostAttackCheck]: null,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerInput,
    };
  else if (Math.random() < 0.5)
    return {
      [StateName.Battle]: StateName.PlayerAttack,
      [StateName.PlayerPostAttackCheck]: StateName.EnemyAttack,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerInput,
    };
  else
    return {
      [StateName.Battle]: StateName.EnemyAttack,
      [StateName.PlayerPostAttackCheck]: StateName.PlayerInput,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerAttack,
    };
};
