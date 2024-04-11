import { PlayerOption } from "@/models/dungeons/battle/menu/PlayerOption";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const playerStore = usePlayerStore();
    const { activeMonster, isActiveMonsterFainted, optionGrid } = storeToRefs(playerStore);
    const actionStore = useActionStore();
    const { hasPlayerAttacked, hasEnemyAttacked } = storeToRefs(actionStore);

    if (optionGrid.value.value === PlayerOption.Fight && !hasPlayerAttacked.value) {
      battleStateMachine.setState(StateName.PlayerAttack);
      return;
    }

    hasPlayerAttacked.value = false;

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(false, () => {
        showMessages(
          [`${activeMonster.value.name} has fainted!`, "You have no more monsters, escaping to safety..."],
          () => {
            battleStateMachine.setState(StateName.Finished);
            hasEnemyAttacked.value = false;
          },
        );
      });
      return;
    }

    battleStateMachine.setState(StateName.PlayerInput);
    hasEnemyAttacked.value = false;
  },
};
