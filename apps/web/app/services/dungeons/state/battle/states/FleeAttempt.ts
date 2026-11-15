import type { State } from "#src/models/dungeons/state/State";

import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { getDungeonsSoundEffect } from "#src/services/dungeons/sound/getDungeonsSoundEffect";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { createRandomBoolean } from "#src/util/math/random/createRandomBoolean";

export const FleeAttempt: State<typeof StateName.FleeAttempt> = {
  name: StateName.FleeAttempt,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;

    if (createRandomBoolean()) {
      await showMessages(scene, ["You failed to run away..."]);
      await battleStateMachine.setState(StateName.EnemyInput);
    } else {
      await showMessages(scene, ["You got away safely!"]);
      getDungeonsSoundEffect(scene, SoundEffectKey.Flee).play();
      await battleStateMachine.setState(StateName.Finished);
    }
  },
};
