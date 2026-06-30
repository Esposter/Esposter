import { z } from "zod";
// One raw-facts record emitted by the Linux-side overlay probe (OVERLAY_PROBE_SCRIPT) for a single entry in an
// Overlay upper. It crosses a process boundary as JSON, so it is zod-validated before use (parseOverlayManifest):
// The lstat facts drive parseOverlayEntryKind, and isSnapshotLowerPath — computed Linux-side against the snapshot
// Lower so the host never reads the WSL filesystem — marks a dep-tree write that must not be flushed. The interface
// Is the contract; the schema validates it. See specs/write-back.md.
export interface OverlayManifestEntry {
  readonly isCharacterDevice: boolean;
  readonly isDirectory: boolean;
  readonly isOpaque: boolean;
  readonly isSnapshotLowerPath: boolean;
  readonly rdev: number;
  readonly relativePath: string;
}

// Explicit `z.ZodObject<…>` annotation (required by --isolatedDeclarations, which can't infer an exported const's
// Type from a zod expression) so the precise object type — and its methods — stay inferred, with
// `satisfies z.ZodType<OverlayManifestEntry>` enforcing the interface contract.
export const overlayManifestEntrySchema: z.ZodObject<{
  isCharacterDevice: z.ZodBoolean;
  isDirectory: z.ZodBoolean;
  isOpaque: z.ZodBoolean;
  isSnapshotLowerPath: z.ZodBoolean;
  rdev: z.ZodNumber;
  relativePath: z.ZodString;
}> = z.object({
  isCharacterDevice: z.boolean(),
  isDirectory: z.boolean(),
  isOpaque: z.boolean(),
  isSnapshotLowerPath: z.boolean(),
  rdev: z.number(),
  relativePath: z.string(),
}) satisfies z.ZodType<OverlayManifestEntry>;
