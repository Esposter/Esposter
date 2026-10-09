import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { ALL_AREAS, DETECTED_CAPABILITIES } from "#src/services/fleet/constants";

// The profile a run writes. The id and areas the user set are kept, and a new profile takes the hostname and every area.
// Detected capabilities are replaced by this run's reading, while a capability outside that list was set by the user
// And is kept
export const mergeMachineProfile = (
  savedProfile: MachineProfile | undefined,
  detectedCapabilities: readonly string[],
  hostname: string,
): MachineProfile => {
  const userCapabilities = (savedProfile?.capabilities ?? []).filter(
    (capability) => !DETECTED_CAPABILITIES.includes(capability),
  );
  return {
    areas: savedProfile?.areas ?? [...ALL_AREAS],
    capabilities: [...new Set([...detectedCapabilities, ...userCapabilities])],
    id: savedProfile?.id || hostname,
  };
};
