import type { SourceMirrorManifestEntry } from "@/models/exec/wsl/SourceMirrorManifestEntry";

import { sourceMirrorManifestEntrySchema } from "@/models/exec/wsl/SourceMirrorManifestEntry";
import { z } from "zod";
// The working tree's change signature at one point in time: every mirrored entry keyed by posix relative path
// (buildSourceMirrorManifest walks the host tree with the same excludes the mirror sync uses). The copy published
// Beside the mirror (manifest.json, atomically mv'd into place after a successful sync) records exactly what the
// Mirror holds, so the next run's delta is `diffSourceMirrorManifests(published, current)` — no 9p stat-walk.
export type SourceMirrorManifest = Record<string, SourceMirrorManifestEntry>;

export const sourceMirrorManifestSchema: z.ZodRecord<z.ZodString, typeof sourceMirrorManifestEntrySchema> = z.record(
  z.string(),
  sourceMirrorManifestEntrySchema,
) satisfies z.ZodType<SourceMirrorManifest>;
