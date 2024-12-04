import { PlayerOption } from "@/models/dungeons/scene/battle/menu/PlayerOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { PlayerBattleMenuOptionGrid } from "@/services/dungeons/scene/battle/menu/PlayerBattleMenuOptionGrid";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";

export const useAttackStatePriorityMap = () => {
  if (PlayerBattleMenuOptionGrid.value !== PlayerOption.Fight)
    return {
      [StateName.Battle]: StateName.EnemyAttack,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerInput,
      [StateName.PlayerPostAttackCheck]: undefined,
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
