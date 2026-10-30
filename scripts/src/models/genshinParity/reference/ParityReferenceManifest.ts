import type { ParityRecordingManifestRow } from "#src/models/genshinParity/reference/ParityRecordingManifestRow";
import type { ParityRecordManifestRow } from "#src/models/genshinParity/reference/ParityRecordManifestRow";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { parityRecordingManifestRowSchema } from "#src/models/genshinParity/reference/ParityRecordingManifestRow";
import { parityRecordManifestRowSchema } from "#src/models/genshinParity/reference/ParityRecordManifestRow";
import { parityReferenceManifestRowSchema } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The one committed manifest: a header naming the game version it was packed from, when known, and one section per kind.
// Every section holds one row per line, so two machines' additions merge by rebase
export interface ParityReferenceManifest {
  animeGameDataCommit?: string;
  gameVersion?: string;
  recordings: ParityRecordingManifestRow[];
  records: ParityRecordManifestRow[];
  references: ParityReferenceManifestRow[];
}

export const parityReferenceManifestSchema: z.ZodType<ParityReferenceManifest> = z.object({
  animeGameDataCommit: z.string().min(1).optional(),
  gameVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/u)
    .optional(),
  recordings: createUniqueArraySchema(parityRecordingManifestRowSchema, "name"),
  records: createUniqueArraySchema(parityRecordManifestRowSchema, "path"),
  references: createUniqueArraySchema(parityReferenceManifestRowSchema, "id"),
});
