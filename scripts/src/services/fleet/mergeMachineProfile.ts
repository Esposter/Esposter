import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { ALL_AREAS, DETECTED_CAPABILITIES } from "#src/services/fleet/constants";

// The profile a run writes. The id and areas the user set are kept, and a new profile takes the hostname and every area.
// Detected capabilities are replaced by this run's reading, while a capability outside that list was set by the user
// and is kept
export const mergeMachineProfile = (
  existing: MachineProfile | undefined,
  detectedCapabilities: readonly string[],
  hostname: string,
): MachineProfile => {
  const userCapabilities = (existing?.capabilities ?? []).filter(
    (capability) => !DETECTED_CAPABILITIES.includes(capability),
  );
  return {
    areas: existing?.areas ?? [...ALL_AREAS],
    capabilities: [...new Set([...detectedCapabilities, ...userCapabilities])],
    id: existing?.id || hostname,
  };
};
