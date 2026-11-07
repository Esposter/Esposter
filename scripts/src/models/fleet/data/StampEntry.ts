import type { Provenance } from "#src/models/provenance/Provenance";

import { provenanceSchema } from "#src/models/provenance/Provenance";
import { z } from "zod";

// A provenance stamp by its path from the parity directory, as the peer or this machine holds it
export interface StampEntry {
  path: string;
  provenance: Provenance;
}

export const stampEntrySchema: z.ZodType<StampEntry> = z.object({ path: z.string(), provenance: provenanceSchema });
