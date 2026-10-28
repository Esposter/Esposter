import type { StateName } from "@/models/dungeons/state/battle/StateName";
import type { State } from "@/models/dungeons/state/State";

import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { prettify } from "@/util/text/prettify";
import { getSynchronizedFunction } from "@esposter/shared";
import { sleepScene } from "vue-phaserjs";

// A monster sent out to the field, whether it came from the party or replaced the one out: its tween, its "Go" line,
// Then the turn passes to whoever acts next
export const createMonsterAppearState = <TStateName extends StateName.BringOutMonster | StateName.SwitchMonster>(
  name: TStateName,
  nextStateName: StateName.EnemyInput | StateName.PlayerInput,
): State<TStateName> => ({
  name,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);

    await useMonsterAppearTween(false);
    getSynchronizedFunction(() => useMonsterInfoContainerAppearTween(false))();
    await showMessageNoInputRequired(scene, `Go ${prettify(activeMonster.value.key)}!`);
    await sleepScene(scene, Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
    await battleStateMachine.setState(nextStateName);
  },
});
