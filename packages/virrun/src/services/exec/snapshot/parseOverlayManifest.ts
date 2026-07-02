import type { OverlayManifestEntry } from "@/models/exec/OverlayManifestEntry";

import { overlayManifestEntrySchema } from "@/models/exec/OverlayManifestEntry";
import { parseJsonWithSchema } from "@/services/exec/util/parseJsonWithSchema";
import { z } from "zod";

const overlayManifestSchema = z.array(overlayManifestEntrySchema);
// Validate the JSON manifest the Linux-side overlay probe writes to stdout into typed records. The manifest is
// Untrusted process output, so parseJsonWithSchema JSON-parses then zod-validates it in one step; any malformed or
// Unexpectedly-shaped output throws an InvalidOperationError naming the failure rather than feeding garbage into
// The flush plan. See specs/write-back.md.
export const parseOverlayManifest = (manifest: string): OverlayManifestEntry[] =>
  parseJsonWithSchema(manifest, overlayManifestSchema, parseOverlayManifest.name);
