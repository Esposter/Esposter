import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";

export const Intro: State<StateName> = {
  name: StateName.Intro,
  onEnter: (scene) => {
    useRectangleCameraMask(scene, async () => {
      await battleStateMachine.setState(StateName.PreBattleInfo);
    });
  },
};
