import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";

import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { GENSHIN_NO_COMMAND_NOTE } from "#src/services/genshinProgress/constants";

// A check no command reads yet: it prints as not measurable under its name, and never as passing
export const checkWithoutCommand = (name: string): GenshinExitCheck => ({
  name,
  notes: [GENSHIN_NO_COMMAND_NOTE],
  state: GenshinExitCheckState.NotMeasurable,
});
