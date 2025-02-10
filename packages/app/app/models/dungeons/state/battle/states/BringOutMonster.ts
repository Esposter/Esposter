import type { State } from "@/models/dungeons/state/State";

import { dayjs } from "#shared/services/dayjs";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { prettify } from "@/util/text/prettify";
import { sleep } from "vue-phaserjs";

export const BringOutMonster: State<StateName> = {
  name: StateName.BringOutMonster,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);

    await useMonsterAppearTween(false);
    useMonsterInfoContainerAppearTween(false);
    // @ts-expect-error Type instantiation is excessively deep and possibly infinite.ts(2589)
    await showMessageNoInputRequired(scene, `Go ${prettify(activeMonster.value.key)}!`);
    await sleep(scene, dayjs.duration(1, "second").asMilliseconds());
    await battleStateMachine.setState(StateName.PlayerInput);
  },
};
