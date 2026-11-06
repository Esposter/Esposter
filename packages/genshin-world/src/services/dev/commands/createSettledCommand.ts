import type { DevCommand } from "#src/models/dev/DevCommand";

import { z } from "zod";

// `settled` answers whether the terrain is settled: yes once the view has every tile it wants and the ones round it, with
// No tile in flight, so a script waits on it before it saves
export const createSettledCommand = ({ checkIsSettled }: { checkIsSettled: () => boolean }): DevCommand => ({
  args: z.object({}),
  argumentNames: [],
  name: "settled",
  run: () => ({ ok: true, value: checkIsSettled() }),
});
