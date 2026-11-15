import { PlayerOption } from "#src/models/dungeons/scene/battle/menu/PlayerOption";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { PlayerBattleMenuOptionGrid } from "#src/services/dungeons/scene/battle/menu/PlayerBattleMenuOptionGrid";
import { createRandomBoolean } from "#src/util/math/random/createRandomBoolean";

export const getAttackStatePriorityMap = () => {
  if (PlayerBattleMenuOptionGrid.value !== PlayerOption.Fight)
    return {
      [StateName.Battle]: StateName.EnemyAttack,
      [StateName.EnemyPostAttackCheck]: StateName.PlayerInput,
      [StateName.PlayerPostAttackCheck]: undefined,
    };
  else if (createRandomBoolean())
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
