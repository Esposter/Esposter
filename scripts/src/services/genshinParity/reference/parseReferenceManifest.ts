import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { parityReferenceManifestSchema } from "#src/models/genshinParity/reference/ParityReferenceManifest";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// The committed manifest from its text, with an empty one when there is no text, which is when no reference, recording or
// record has been packed yet
export const parseReferenceManifest = (text: string | undefined): ParityReferenceManifest =>
  text === undefined
    ? { records: [], recordings: [], references: [] }
    : parityReferenceManifestSchema.parse(parseMachineJson(text));
