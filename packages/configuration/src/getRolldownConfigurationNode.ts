import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationBrowser } from "./getRolldownConfigurationBrowser";

export const getRolldownConfigurationNode = (): RolldownOptions => ({
  ...getRolldownConfigurationBrowser(),
  platform: "node",
});
