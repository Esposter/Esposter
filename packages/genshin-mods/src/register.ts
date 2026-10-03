import type { Register } from "claude-code";

import { registerBand } from "./services/band/registerBand";
import { registerCommission } from "./services/commission/registerCommission";
import { registerLifecycle } from "./services/registerLifecycle";
import { registerVeil } from "./services/veil/registerVeil";
import { registerWard } from "./services/ward/registerWard";

export const register: Register = (on) => {
  registerBand(on);
  registerCommission(on);
  registerLifecycle(on);
  registerVeil(on);
  registerWard(on);
};
