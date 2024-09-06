import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";

export const CatchMonster: State<StateName> = {
  name: StateName.CatchMonster,
  onEnter: async (scene) => {
    const isCaptureSuccessful = true;
    await useThrowBallAnimation(scene, isCaptureSuccessful);
    isCaptureSuccessful
      ? battleStateMachine.setState(StateName.Finished)
      : battleStateMachine.setState(StateName.EnemyInput);
  },
};
