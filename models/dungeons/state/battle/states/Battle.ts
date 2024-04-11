import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";

export const Battle: State<StateName> = {
  name: StateName.Battle,
  onEnter: () => {
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
    const actionStore = useActionStore();
    const { itemUsed, isFleeAttempted } = storeToRefs(actionStore);

    if (itemUsed.value) {
      itemUsed.value = undefined;
      battleStateMachine.setState(StateName.EnemyAttack);
    } else if (isFleeAttempted.value) {
      isFleeAttempted.value = false;
      battleStateMachine.setState(StateName.EnemyAttack);
    } else if (Math.random() < 0.5) battleStateMachine.setState(StateName.EnemyAttack);
    else battleStateMachine.setState(StateName.PlayerAttack);
  },
};
