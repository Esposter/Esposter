import { SourceMirrorEntryType } from "#src/models/exec/wsl/SourceMirrorEntryType";
import { z } from "zod";
// One working-tree entry's change signature in a source-mirror manifest, keyed by its posix relative path. Files carry
// Size + mtimeMs (rsync's classic quick-check signal), symlinks carry their target, directories carry presence only —
// Non-participating fields are zeroed/blank rather than optional so equality is a flat four-field compare. Persisted
// As JSON beside the mirror and read back by a later process, so it is zod-validated before use
// (readSourceMirrorPublication).
export interface SourceMirrorManifestEntry {
  readonly mtimeMs: number;
  readonly size: number;
  readonly target: string;
  readonly type: SourceMirrorEntryType;
}

export const sourceMirrorManifestEntrySchema: z.ZodObject<{
  mtimeMs: z.ZodNumber;
  size: z.ZodNumber;
  target: z.ZodString;
  type: z.ZodEnum<typeof SourceMirrorEntryType>;
}> = z.object({
  mtimeMs: z.number().nonnegative(),
  size: z.int().nonnegative(),
  target: z.string(),
  type: z.enum(SourceMirrorEntryType),
}) satisfies z.ZodType<SourceMirrorManifestEntry>;
