import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useMonsterPartyItemStore } from "@/store/dungeons/monsterParty/item";
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
    const monsterPartyItemStore = useMonsterPartyItemStore();
    const { onUnusedItemComplete, onUseItemComplete } = storeToRefs(monsterPartyItemStore);
    const { launchScene } = usePreviousScene(sceneKey.value);

    onUnusedItemComplete.value = () => {
      const { switchToPreviousScene } = usePreviousScene(sceneKey.value);
      switchToPreviousScene();
      battleStateMachine.setState(StateName.PlayerInput);
    };
    onUseItemComplete.value = (item) => {
      const { switchToPreviousScene } = usePreviousScene(sceneKey.value);
      // Switch back from MonsterParty -> Inventory -> Battle scene
      switchToPreviousScene();
      switchToPreviousScene();
      battleStateMachine.setState(StateName.EnemyInput);
      showMessages([`You used ${item.name} on ${activeMonster.value.name}.`]);
    };
    launchScene(SceneKey.Inventory);
  },
  onExit: () => {
    const monsterPartyItemStore = useMonsterPartyItemStore();
    const { onUnusedItemComplete, onUseItemComplete } = storeToRefs(monsterPartyItemStore);

    onUnusedItemComplete.value = undefined;
    onUseItemComplete.value = undefined;
  },
};
