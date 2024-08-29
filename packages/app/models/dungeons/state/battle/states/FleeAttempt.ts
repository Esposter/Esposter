import type { State } from "@/models/dungeons/state/State";

import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;

    if (generateRandomBoolean()) {
      await showMessages(scene, ["You failed to run away..."]);
      await battleStateMachine.setState(StateName.EnemyInput);
      return;
    }

    await showMessages(scene, ["You got away safely!"]);
    getDungeonsSoundEffect(scene, SoundEffectKey.Flee).play();
    await battleStateMachine.setState(StateName.Finished);
  },
};
