import type { DevCommand } from "#src/models/dev/DevCommand";

import { z } from "zod";

// `settled` answers whether the terrain has no tile in flight: yes once every tile the view asked for has been given, so a
// Script waits on it before it saves
export const createSettledCommand = ({ getPendingCount }: { getPendingCount: () => number }): DevCommand => ({
  args: z.object({}),
  argumentNames: [],
  name: "settled",
  run: () => ({ ok: true, value: getPendingCount() === 0 }),
});
