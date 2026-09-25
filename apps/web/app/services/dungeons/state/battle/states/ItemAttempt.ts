import type { State } from "@/models/dungeons/state/State";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { createPhaserSubscriptions } from "@/services/phaser/createPhaserSubscriptions";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { prettify } from "@/util/text/prettify";

const { subscribe, unsubscribeAll } = createPhaserSubscriptions();

export const ItemAttempt: State<StateName.ItemAttempt> = {
  name: StateName.ItemAttempt,
  onEnter: (battleScene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const { launchScene } = usePreviousScene(battleScene.scene.key);

    subscribe(
      "useItem",
      getSynchronizedFunction(async (scene, item, monster, onComplete) => {
        const { removeScenesAbove, switchToPreviousScene } = usePreviousScene(scene.scene.key);
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
