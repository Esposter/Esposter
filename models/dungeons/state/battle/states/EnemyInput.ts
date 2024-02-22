import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";

export const EnemyInput: State<StateName> = {
  name: StateName.EnemyInput,
  onEnter: () => {
    battleStateMachine.setState(StateName.Battle);
  },
};
