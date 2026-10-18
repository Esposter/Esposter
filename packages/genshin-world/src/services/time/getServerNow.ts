// The server's clock now, read from this machine's clock and the offset it runs behind or ahead of the server's by
export const getServerNow = (serverClockOffsetMs: number): Temporal.Instant =>
  Temporal.Now.instant().add({ milliseconds: serverClockOffsetMs });
