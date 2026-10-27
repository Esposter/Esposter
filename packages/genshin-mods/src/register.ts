import type { Register } from "claude-code";

import { registerBand } from "./services/band/registerBand";
import { registerCommission } from "./services/commission/registerCommission";
import { registerDelegation } from "./services/delegation/registerDelegation";
import { registerDiskScan } from "./services/diskScan/registerDiskScan";
import { registerLifecycle } from "./services/registerLifecycle";
import { registerReserveGate } from "./services/resin/registerReserveGate";
import { registerSins } from "./services/sins/registerSins";
import { registerVeil } from "./services/veil/registerVeil";
import { registerWard } from "./services/ward/registerWard";
import { registerWholeIndex } from "./services/ward/registerWholeIndex";

export const register: Register = (on, options) => {
  // The plugin's typesafe_key option, empty when it is not set: the sins readers fall back to the TYPESAFE_API_KEY variable
  const typeSafeKey = typeof options.typesafe_key === "string" ? options.typesafe_key : "";
  registerBand(on, typeSafeKey);
  registerCommission(on);
  registerDelegation(on);
  registerDiskScan(on);
  registerLifecycle(on, typeSafeKey);
  registerReserveGate(on);
  registerSins(on, typeSafeKey);
  registerVeil(on);
  registerWard(on);
  registerWholeIndex(on);
};
