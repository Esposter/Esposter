import { SocketErrorMeaning } from "#src/models/machine/SocketErrorMeaning";

// Which error a socket path's listen or connect fails with means. EADDRINUSE is another listener's path, ECONNREFUSED a
// Socket File no listener answers for, and ENOENT no path at all. Any other error is one the lock cannot judge, so it
// Is thrown
export const getSocketErrorMeaning = (error: Error): SocketErrorMeaning => {
  const code = "code" in error ? error.code : undefined;
  switch (code) {
    case "EADDRINUSE":
      return SocketErrorMeaning.Contended;
    case "ECONNREFUSED":
      return SocketErrorMeaning.Refused;
    case "ENOENT":
      return SocketErrorMeaning.Absent;
    default:
      return SocketErrorMeaning.Unknown;
  }
};
