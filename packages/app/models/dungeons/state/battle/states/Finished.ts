import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { useDungeonsStore } from "@/store/dungeons";
import { SceneKey } from "vue-phaser";

export const Finished: State<StateName> = {
  name: StateName.Finished,
  onEnter: (scene) => {
    const dungeonsStore = useDungeonsStore();
    const { fadeSwitchToScene } = dungeonsStore;
    fadeSwitchToScene(scene, SceneKey.World);
  },
};
