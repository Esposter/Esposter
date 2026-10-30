import type { DevCommand } from "#src/models/dev/DevCommand";

import { z } from "zod";

// `stat <on|off>` shows or hides the stats overlay, and answers whether it is shown
export const createStatCommand = ({ setStatShown }: { setStatShown: (isShown: boolean) => void }): DevCommand => ({
  args: z.object({ state: z.enum(["on", "off"]) }),
  argumentNames: ["state"],
  name: "stat",
  run: ({ state }) => {
    const isShown = state === "on";
    setStatShown(isShown);
    return { ok: true, value: isShown };
  },
});
