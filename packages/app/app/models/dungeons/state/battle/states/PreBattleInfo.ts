import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { prettify } from "@/util/text/prettify";

export const PreBattleInfo: State<StateName> = {
  name: StateName.PreBattleInfo,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);

    await useMonsterAppearTween(true);
    useMonsterInfoContainerAppearTween(true);
    await showMessages(scene, [`A wild ${prettify(activeMonster.value.key)} has appeared!`]);
    await battleStateMachine.setState(StateName.BringOutMonster);
  },
};
