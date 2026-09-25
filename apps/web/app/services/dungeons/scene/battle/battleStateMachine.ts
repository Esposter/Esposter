import type { StateName } from "@/models/dungeons/state/battle/StateName";

import { StateMachine } from "@/services/dungeons/state/StateMachine";

export const battleStateMachine = new StateMachine<StateName>();
