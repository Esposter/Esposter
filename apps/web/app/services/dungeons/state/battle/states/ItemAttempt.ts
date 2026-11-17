import type { State } from "#src/models/dungeons/state/State";

import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { transitionFrom } from "#src/services/dungeons/scene/transitionFrom";
import { createPhaserSubscriptions } from "#src/services/phaser/createPhaserSubscriptions";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { prettify } from "#src/util/text/prettify";
import { getSynchronizedFunction } from "@esposter/shared";

const { subscribe, unsubscribeAll } = createPhaserSubscriptions();

export const ItemAttempt: State<typeof StateName.ItemAttempt> = {
  name: StateName.ItemAttempt,
  onEnter: (battleScene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const { launchScene } = transitionFrom(battleScene.scene.key);

    subscribe(
      "useItem",
      getSynchronizedFunction(async (scene, item, monster, onComplete) => {
        const { removeScenesAbove, switchToPreviousScene } = transitionFrom(scene.scene.key);
        removeScenesAbove(scene, SceneKey.Battle);
        switchToPreviousScene(scene);
        await showMessages(battleScene, [`You used ${prettify(item.id)} on ${prettify(monster.key)}.`]);
        await onComplete();
      }),
    );
    subscribe(
      "unuseItem",
      getSynchronizedFunction(() => battleStateMachine.setState(StateName.PlayerInput)),
    );

    launchScene(battleScene, SceneKey.Inventory);
  },
  onExit: () => {
    unsubscribeAll();
  },
};
