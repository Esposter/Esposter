import type { State } from "@/models/dungeons/state/State";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;

    if (createRandomBoolean()) {
      await showMessages(scene, ["You failed to run away..."]);
      await battleStateMachine.setState(StateName.EnemyInput);
      return;
    }

    await showMessages(scene, ["You got away safely!"]);
    getDungeonsSoundEffect(scene, FileKey.ThirdPartyLeohpazFlee).play();
    await battleStateMachine.setState(StateName.Finished);
  },
};
