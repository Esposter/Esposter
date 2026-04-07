import type { RolldownOptions } from "rolldown";

import { rolldownConfigurationBrowser } from "@/rolldownConfigurationBrowser";

export const rolldownConfigurationNode: RolldownOptions = {
  ...rolldownConfigurationBrowser,
  platform: "node",
};
