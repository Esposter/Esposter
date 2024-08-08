import type { State } from "@/models/dungeons/state/State";

import { PlayerOption } from "@/models/dungeons/scene/battle/menu/PlayerOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";

export const Battle: State<StateName> = {
  name: StateName.Battle,
  onEnter: async () => {
    /**
     * 1. Show attack used
     * 2. Brief pause
     * 3. Play attack animation
     * 4. Brief pause
     * 5. Play damage animation
     * 6. Brief pause
     * 7. Play health bar animation
     * 8. Brief pause
     * 9. Repeat the steps above for the other monster if necessary
     */
    const battlePlayerStore = useBattlePlayerStore();
    const { optionGrid } = storeToRefs(battlePlayerStore);
    const actionStore = useActionStore();
    const { attackStatePriorityMap } = storeToRefs(actionStore);

    attackStatePriorityMap.value = useAttackStatePriorityMap();

    if (
      optionGrid.value.value === PlayerOption.Fight &&
      attackStatePriorityMap.value[StateName.Battle] === StateName.PlayerAttack
    )
      await battleStateMachine.setState(StateName.PlayerAttack);
    else await battleStateMachine.setState(StateName.EnemyAttack);
  },
};
