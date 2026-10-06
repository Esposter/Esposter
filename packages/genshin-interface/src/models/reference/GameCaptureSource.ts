import type { GameSourceKind } from "#src/models/reference/GameSourceKind";

// A recording or a still of the running game: its file in the parity directory's captures, the parity reference that
// Takes a frame of it, or both, its title as published, and what the derivation takes from it
export type GameCaptureSource = GameCaptureSourceBase &
  ({ capture: string; parityReference?: string } | { capture?: never; parityReference: string });
interface GameCaptureSourceBase {
  kind: GameSourceKind.Capture;
  name: string;
  role: string;
}
