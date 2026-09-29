import type { StringArgDef } from "citty";

import { DEFAULT_APP_ORIGIN, DEFAULT_HOSTNAME, DEFAULT_PORT } from "#src/services/constants";

// Where the host listens and which page it pairs with, as serving and managing the paired pages both read them.
// `--hostname 0.0.0.0` is what lets another machine reach it
export const hostArgs: Record<"hostname" | "origin" | "port", StringArgDef & { default: string }> = {
  hostname: { default: DEFAULT_HOSTNAME, description: "The address the host listens on", type: "string" },
  origin: { default: DEFAULT_APP_ORIGIN, description: "The app's origin the printed link opens", type: "string" },
  port: { default: String(DEFAULT_PORT), description: "The port the host listens on", type: "string" },
};
