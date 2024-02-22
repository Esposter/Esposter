import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";

export const BringOutMonster: State<StateName> = {
  name: StateName.BringOutMonster,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const dialogStore = useDialogStore();
    const { showMessageNoInputRequired } = dialogStore;
    const playerStore = usePlayerStore();
    const { activeMonster } = storeToRefs(playerStore);
    const infoPanelStore = useInfoPanelStore();
    const { line1Text } = storeToRefs(infoPanelStore);

    useMonsterAppearTween(false, () => {
      useMonsterInfoContainerAppearTween(false);
      showMessageNoInputRequired(line1Text, `Go ${activeMonster.value.name}!`, () =>
        scene.value.time.delayedCall(dayjs.duration(1.2, "second").asMilliseconds(), () =>
          battleStateMachine.setState(StateName.PlayerInput),
        ),
      );
    });
  },
};
