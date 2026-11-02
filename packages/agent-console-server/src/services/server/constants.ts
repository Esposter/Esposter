// How long a host already on the port has to prove itself before whatever holds the port is taken for another program
export const HOST_PROBE_TIMEOUT_MS = 2000;
// How long a socket may take to finish its handshake before the host closes it. A page that connects and says nothing,
// or a program on the port that never answers, holds its socket no longer than this
export const HANDSHAKE_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
