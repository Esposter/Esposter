import { PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";

// The sidecar stamp of a file output: the file's own path with the sidecar suffix appended
export const getSidecarPath = (file: string): string => `${file}${PROVENANCE_SIDECAR_SUFFIX}`;
