// The outcomes of one attempt at the socket lock: the path is this process's now (Held), a live holder answers at it
// (Live), Nothing is at it by the time it is probed (Absent), or its socket file has no listener, a dead holder's
// (Stale)
export const SocketAttemptKind = { Absent: "Absent", Held: "Held", Live: "Live", Stale: "Stale" } as const;
export type SocketAttemptKind = (typeof SocketAttemptKind)[keyof typeof SocketAttemptKind];
