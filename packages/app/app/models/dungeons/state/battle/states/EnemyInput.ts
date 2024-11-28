import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";

export const EnemyInput: State<StateName> = {
  name: StateName.EnemyInput,
  onEnter: async () => {
    await battleStateMachine.setState(StateName.Battle);
  },
};
