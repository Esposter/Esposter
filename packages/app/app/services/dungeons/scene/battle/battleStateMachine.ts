import { StateMap } from "@/models/dungeons/state/battle/StateMap";
import { StateMachine } from "@/models/dungeons/state/StateMachine";

export const battleStateMachine = new StateMachine(StateMap);
