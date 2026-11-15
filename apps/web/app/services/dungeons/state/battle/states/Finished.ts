import type { State } from "#src/models/dungeons/state/State";

import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { useDungeonsStore } from "#src/store/dungeons/index";

export const Finished: State<typeof StateName.Finished> = {
  name: StateName.Finished,
  onEnter: (scene) => {
    const dungeonsStore = useDungeonsStore();
    const { fadeSwitchToScene } = dungeonsStore;
    fadeSwitchToScene(scene, SceneKey.World);
  },
};
