import type { Provenance } from "#src/models/provenance/Provenance";

// Whether a stamp names the install's game version. A missing stamp vouches for nothing
export const checkIsVouchedBy = (provenance: Provenance | undefined, gameVersion: string): boolean =>
  provenance?.gameVersion === gameVersion;
