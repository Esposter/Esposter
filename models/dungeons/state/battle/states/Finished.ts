import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { Cameras } from "phaser";

export const Finished: State<StateName> = {
  name: StateName.Finished,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { switchToScene } = phaserStore;
    const { scene } = storeToRefs(phaserStore);
    scene.value.cameras.main.fadeOut(dayjs.duration(0.6, "seconds").asMilliseconds(), 0, 0, 0);
    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => switchToScene(SceneKey.World));
  },
};
