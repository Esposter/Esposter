import type { State } from "#src/models/dungeons/state/State";

import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";

export const EnemyInput: State<typeof StateName.EnemyInput> = {
  name: StateName.EnemyInput,
  onEnter: async () => {
    await battleStateMachine.setState(StateName.Battle);
  },
};
