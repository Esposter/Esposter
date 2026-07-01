// The lstat facts parseOverlayEntryKind needs (from a node fs.Stats or a fixture).
export interface OverlayEntryStats {
  readonly isCharacterDevice: boolean;
  readonly isDirectory: boolean;
  readonly rdev: number;
}
