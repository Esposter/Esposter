import type { SocketAttemptKind } from "#src/models/machine/SocketAttemptKind";
import type { Socket } from "node:net";

// One attempt at the socket lock, and what it found: the release that gives the path back when this process holds it,
// The connection to a live holder, or nothing, or a stale socket file
export type SocketAttempt =
  | { kind: typeof SocketAttemptKind.Absent }
  | { kind: typeof SocketAttemptKind.Held; release: () => void }
  | { kind: typeof SocketAttemptKind.Live; socket: Socket }
  | { kind: typeof SocketAttemptKind.Stale };
