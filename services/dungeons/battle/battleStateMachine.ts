import { StateMachine } from "@/models/dungeons/state/StateMachine";
import { StateMap } from "@/models/dungeons/state/battle/StateMap";
import type { StateName } from "@/models/dungeons/state/battle/StateName";

export const battleStateMachine = new StateMachine<StateName>(StateMap);
