import type { OverlayManifestEntry } from "@/models/exec/OverlayManifestEntry";

import { overlayManifestEntrySchema } from "@/models/exec/OverlayManifestEntry";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const overlayManifestSchema = z.array(overlayManifestEntrySchema);
// Validate the JSON manifest the Linux-side overlay probe writes to stdout into typed records. The manifest is
// Untrusted process output, so it is JSON-parsed then zod-validated in one getResult; any malformed or
// Unexpectedly-shaped output throws an InvalidOperationError naming the failure rather than feeding garbage into
// The flush plan. See specs/write-back.md.
export const parseOverlayManifest = (manifest: string): OverlayManifestEntry[] =>
  getResult(() => overlayManifestSchema.parse(JSON.parse(manifest))).match(
    (entries) => entries,
    (error) => {
      throw new InvalidOperationError(
        Operation.Read,
        parseOverlayManifest.name,
        error instanceof Error ? error.message : String(error),
      );
    },
  );
