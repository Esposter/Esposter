import type { State } from "#src/models/dungeons/state/State";

import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { animateRectangleCameraMask } from "#src/services/dungeons/camera/animateRectangleCameraMask";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";

export const Intro: State<typeof StateName.Intro> = {
  name: StateName.Intro,
  onEnter: async (scene) => {
    await animateRectangleCameraMask(scene);
    await battleStateMachine.setState(StateName.PreBattleInfo);
  },
};
