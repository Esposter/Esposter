import { z } from "zod";
// Raw facts the overlay probe emits per upper entry. Crosses a process boundary as JSON, so it is zod-validated
// Before use (parseOverlayManifest); isSnapshotLowerPath is computed Linux-side so the host never reads the WSL
// Filesystem. See specs/write-back.md.
export interface OverlayManifestEntry {
  readonly isCharacterDevice: boolean;
  readonly isDirectory: boolean;
  readonly isOpaque: boolean;
  readonly isSnapshotLowerPath: boolean;
  readonly rdev: number;
  readonly relativePath: string;
}

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
