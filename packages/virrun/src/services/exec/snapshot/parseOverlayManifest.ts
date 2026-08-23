import type { OverlayManifestEntry } from "#src/models/exec/snapshot/OverlayManifestEntry";

import { overlayManifestEntrySchema } from "#src/models/exec/snapshot/OverlayManifestEntry";
import { parseJsonWithSchema } from "#src/services/exec/util/parseJsonWithSchema";
import { createUniqueArraySchema } from "@esposter/shared";

const overlayManifestSchema = createUniqueArraySchema(overlayManifestEntrySchema, "relativePath");
// Validate the JSON manifest the Linux-side overlay probe writes to stdout into typed records. The manifest is
// Untrusted process output, so parseJsonWithSchema JSON-parses then zod-validates it in one step; any malformed or
// Unexpectedly-shaped output throws an InvalidOperationError naming the failure rather than feeding garbage into
// The flush plan. See specs/write-back.md.
export const parseOverlayManifest = (manifest: string): OverlayManifestEntry[] =>
  parseJsonWithSchema(manifest, overlayManifestSchema, parseOverlayManifest.name);
