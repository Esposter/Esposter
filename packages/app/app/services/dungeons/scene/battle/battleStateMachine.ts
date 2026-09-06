import { StateMap } from "@/services/dungeons/state/battle/StateMap";
import { StateMachine } from "@/services/dungeons/state/StateMachine";

export const battleStateMachine = new StateMachine(StateMap);
