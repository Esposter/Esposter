import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const BringOutMonster: State<StateName> = {
  name: StateName.BringOutMonster,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const playerStore = usePlayerStore();
    const { activeMonster } = storeToRefs(playerStore);
    const infoPanelStore = useInfoPanelStore();
    const { showMessageNoInputRequired } = infoPanelStore;

    useMonsterAppearTween(false, () => {
      useMonsterInfoContainerAppearTween(false);
      showMessageNoInputRequired(`Go ${activeMonster.value.name}!`, () =>
        scene.value.time.delayedCall(dayjs.duration(1.2, "second").asMilliseconds(), () =>
          battleStateMachine.setState(StateName.PlayerInput),
        ),
      );
    });
  },
};
