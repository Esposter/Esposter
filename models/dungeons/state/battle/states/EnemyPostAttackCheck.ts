import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const playerStore = usePlayerStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(playerStore);

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(false, () => {
        showMessages(
          [`${activeMonster.value.name} has fainted!`, "You have no more monsters, escaping to safety..."],
          () => {
            battleStateMachine.setState(StateName.Finished);
          },
        );
      });
      return;
    }

    battleStateMachine.setState(StateName.PlayerInput);
  },
};
