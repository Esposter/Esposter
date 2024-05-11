import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;

    if (generateRandomBoolean()) {
      showMessages(scene, ["You failed to run away..."], () => {
        battleStateMachine.setState(StateName.EnemyInput);
      });
      return;
    }

    showMessages(scene, ["You got away safely!"], () => {
      getDungeonsSoundEffect(scene, SoundEffectKey.Flee).play();
      battleStateMachine.setState(StateName.Finished);
    });
  },
};
