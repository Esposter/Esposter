import { z } from "zod";
// Raw facts the overlay probe emits per upper entry. Crosses a process boundary as JSON, so it is zod-validated
// Before use (parseOverlayManifest); checkIsSnapshotLowerPath is computed Linux-side so the host never reads the WSL
// Filesystem. See specs/write-back.md.
export interface OverlayManifestEntry {
  readonly checkIsSnapshotLowerPath: boolean;
  readonly isCharacterDevice: boolean;
  readonly isDirectory: boolean;
  readonly isOpaque: boolean;
  readonly rdev: number;
  readonly relativePath: string;
}

export const overlayManifestEntrySchema: z.ZodObject<{
  checkIsSnapshotLowerPath: z.ZodBoolean;
  isCharacterDevice: z.ZodBoolean;
  isDirectory: z.ZodBoolean;
  isOpaque: z.ZodBoolean;
  rdev: z.ZodNumber;
  relativePath: z.ZodString;
}> = z.object({
  checkIsSnapshotLowerPath: z.boolean(),
  isCharacterDevice: z.boolean(),
  isDirectory: z.boolean(),
  isOpaque: z.boolean(),
  rdev: z.int().nonnegative(),
  relativePath: z.string(),
}) satisfies z.ZodType<OverlayManifestEntry>;
