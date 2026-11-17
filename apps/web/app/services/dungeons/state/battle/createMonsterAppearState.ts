import type { StateName } from "#src/models/dungeons/state/battle/StateName";
import type { State } from "#src/models/dungeons/state/State";

import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { animateMonsterAppear } from "#src/services/dungeons/scene/battle/monster/animateMonsterAppear";
import { animateMonsterInfoContainerAppear } from "#src/services/dungeons/scene/battle/monster/animateMonsterInfoContainerAppear";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";
import { prettify } from "#src/util/text/prettify";
import { getSynchronizedFunction } from "@esposter/shared";
import { sleepScene } from "vue-phaserjs";

// A monster sent out to the field, whether it came from the party or replaced the one out: its tween, its "Go" line,
// Then the turn passes to whoever acts next
export const createMonsterAppearState = <
  TStateName extends typeof StateName.BringOutMonster | typeof StateName.SwitchMonster,
>(
  name: TStateName,
  nextStateName: typeof StateName.EnemyInput | typeof StateName.PlayerInput,
): State<TStateName> => ({
  name,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);

    await animateMonsterAppear(false);
    getSynchronizedFunction(() => animateMonsterInfoContainerAppear(false))();
    await showMessageNoInputRequired(scene, `Go ${prettify(activeMonster.value.key)}!`);
    await sleepScene(scene, Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
    await battleStateMachine.setState(nextStateName);
  },
});
