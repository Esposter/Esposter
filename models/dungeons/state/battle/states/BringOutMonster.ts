import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";

export const BringOutMonster: State<StateName> = {
  name: StateName.BringOutMonster,
  onEnter: (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);

    useMonsterAppearTween(false, () => {
      useMonsterInfoContainerAppearTween(false);
      showMessageNoInputRequired(scene, `Go ${activeMonster.value.key}!`, () =>
        scene.time.delayedCall(dayjs.duration(1.2, "second").asMilliseconds(), () => {
          battleStateMachine.setState(StateName.PlayerInput);
        }),
      );
    });
  },
};
