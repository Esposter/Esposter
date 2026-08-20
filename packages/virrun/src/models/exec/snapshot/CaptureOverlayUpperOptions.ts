// What one captured overlay layer contributes on top of the shared publish protocol.
export interface CaptureOverlayUpperOptions {
  // The snapshot directory the temps and the published upper live in.
  dir: string;
  // Names the command in the provision failure message ("snapshot setup command", "prepare command").
  failureLabel: string;
  // Read-only lowers stacked under the capture; omitted for a layer that stacks on the source dir alone.
  lowerDirs?: readonly string[];
  // The caller's own name, so a thrown InvalidOperationError points at the layer rather than at this helper.
  operationName: string;
  // Strips whatever this layer must not freeze, run against the private temp upper before it is published.
  prune: (captureUpperDir: string) => void;
  // The already-resolved publish target; never re-resolved here.
  upperDir: string;
}
