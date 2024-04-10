import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useItemStore } from "@/store/dungeons/monsterParty/item";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export const ItemAttempt: State<StateName> = {
  name: StateName.ItemAttempt,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { sceneKey } = storeToRefs(phaserStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster } = storeToRefs(monsterPartySceneStore);
    const itemStore = useItemStore();
    const { onUnuseItemComplete, onUseItemComplete } = storeToRefs(itemStore);
    const { launchScene } = usePreviousScene(sceneKey.value);

    onUnuseItemComplete.value = () => {
      battleStateMachine.setState(StateName.PlayerInput);
    };
    onUseItemComplete.value = (item) => {
      showMessages([`You used ${item.name} on ${activeMonster.value.name}.`], () => {
        battleStateMachine.setState(StateName.EnemyInput);
      });
    };
    launchScene(SceneKey.Inventory);
  },
  onExit: () => {
    const itemStore = useItemStore();
    const { onUnuseItemComplete, onUseItemComplete } = storeToRefs(itemStore);

    onUnuseItemComplete.value = undefined;
    onUseItemComplete.value = undefined;
  },
};
