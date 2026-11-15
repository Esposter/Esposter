import type { StateName } from "#src/models/dungeons/state/battle/StateName";

import { StateMachine } from "#src/services/dungeons/state/StateMachine";

export const battleStateMachine = new StateMachine<StateName>();
