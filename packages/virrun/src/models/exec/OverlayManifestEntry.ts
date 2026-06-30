import { z } from "zod";
// One raw-facts record emitted by the Linux-side overlay probe (OVERLAY_PROBE_SCRIPT) for a single entry in an
// overlay upper. It crosses a process boundary as JSON, so it is zod-validated before use (parseOverlayManifest):
// the lstat facts drive parseOverlayEntryKind, and isSnapshotLowerPath — computed Linux-side against the snapshot
// lower so the host never reads the WSL filesystem — marks a dep-tree write that must not be flushed. The interface
// is the contract; the schema validates it. See specs/write-back.md.
export interface OverlayManifestEntry {
  readonly isCharacterDevice: boolean;
  readonly isDirectory: boolean;
  readonly isOpaque: boolean;
  readonly isSnapshotLowerPath: boolean;
  readonly rdev: number;
  readonly relativePath: string;
}

export const overlayManifestEntrySchema = z.object({
  isCharacterDevice: z.boolean(),
  isDirectory: z.boolean(),
  isOpaque: z.boolean(),
  isSnapshotLowerPath: z.boolean(),
  rdev: z.number(),
  relativePath: z.string(),
}) satisfies z.ZodType<OverlayManifestEntry>;
