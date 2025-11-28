import type { State } from "@/models/dungeons/state/State";

import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { useDungeonsStore } from "@/store/dungeons";

export const Finished: State<StateName> = {
  name: StateName.Finished,
  onEnter: (scene) => {
    const dungeonsStore = useDungeonsStore();
    const { fadeSwitchToScene } = dungeonsStore;
    fadeSwitchToScene(scene, SceneKey.World);
  },
};
