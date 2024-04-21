import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;

    if (generateRandomBoolean()) {
      showMessages(["You failed to run away..."], () => {
        battleStateMachine.setState(StateName.EnemyInput);
      });
      return;
    }

    const { play } = useDungeonsSoundEffect(SoundEffectKey.Flee);
    showMessages(["You got away safely!"], () => {
      play();
      battleStateMachine.setState(StateName.Finished);
    });
  },
};
