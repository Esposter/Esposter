import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { usePhaserStore } from "~/lib/phaser/store/phaser";
import { useBattleSceneStore } from "~/store/dungeons/scene/battle";
import { useInfoPanelStore } from "~/store/dungeons/scene/battle/infoPanel";

export const BringOutMonster: State<StateName> = {
  name: StateName.BringOutMonster,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const battleSceneStore = useBattleSceneStore();
    const { battleStateMachine } = battleSceneStore;
    const { activePlayerMonster } = storeToRefs(battleSceneStore);
    const infoPanelStore = useInfoPanelStore();
    const { showMessageNoInputRequired } = infoPanelStore;

    activePlayerMonster.value.playMonsterAppearAnimation(() => {
      activePlayerMonster.value.playHealthBarAppearAnimation();
      showMessageNoInputRequired(`Go ${activePlayerMonster.value.name}!`, () => {
        scene.value.time.delayedCall(dayjs.duration(1.2, "second").asMilliseconds(), () => {
          battleStateMachine.setState(StateName.PlayerInput);
        });
      });
    });
  },
};
