import type { Provenance } from "#src/models/provenance/Provenance";

import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { readStamp } from "#src/services/provenance/readStamp";

// The sidecar stamp of a file output, or undefined when the file has none
export const readFileProvenance = (file: string): Promise<Provenance | undefined> => readStamp(getSidecarPath(file));
