import type { DevCommand } from "#src/models/dev/DevCommand";
import type { ScreenKind } from "#src/models/screen/ScreenKind";

import { z } from "zod";

// `screen` names the kind of the screen open over the world, `World` when nothing is over it, read from the screen the session
// Shows now
export const createScreenCommand = ({ getScreenKind }: { getScreenKind: () => ScreenKind }): DevCommand => ({
  args: z.object({}),
  argumentNames: [],
  name: "screen",
  run: () => ({ ok: true, value: getScreenKind() }),
});
