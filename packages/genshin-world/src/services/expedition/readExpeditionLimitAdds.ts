import type { ExpeditionLimitAdd } from "#src/models/expedition/ExpeditionLimitAdd";

import limitsJson from "#src/data/expeditions/limits.json";
import { expeditionLimitAddSchema } from "#src/models/expedition/ExpeditionLimitAdd";
import { z } from "zod";

// The Adventure Ranks that raise the expedition limit, as `genshin:assets expeditions` writes them, checked against their
// Shape as the world loads them
export const readExpeditionLimitAdds = (): ExpeditionLimitAdd[] => z.array(expeditionLimitAddSchema).parse(limitsJson);
