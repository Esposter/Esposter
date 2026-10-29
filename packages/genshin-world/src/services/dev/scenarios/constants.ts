import type { DevScenario } from "#src/models/dev/DevScenario";

import { bossFightScenario } from "#src/services/dev/scenarios/bossFightScenario";
import { chestsEveryTierScenario } from "#src/services/dev/scenarios/chestsEveryTierScenario";
import { fullBagScenario } from "#src/services/dev/scenarios/fullBagScenario";
import { nightAtWindriseScenario } from "#src/services/dev/scenarios/nightAtWindriseScenario";

// The scenarios the world hands the panel, one for each feature that already exists with a command to reach it
export const DEV_SCENARIOS: readonly DevScenario[] = [
  bossFightScenario,
  chestsEveryTierScenario,
  fullBagScenario,
  nightAtWindriseScenario,
];
