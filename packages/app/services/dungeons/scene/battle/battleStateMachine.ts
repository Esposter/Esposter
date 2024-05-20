import { StateMachine } from "@/models/dungeons/state/StateMachine";
import { StateMap } from "@/models/dungeons/state/battle/StateMap";

export const battleStateMachine = new StateMachine(StateMap);
