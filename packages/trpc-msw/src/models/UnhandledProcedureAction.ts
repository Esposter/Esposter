// What the handler does with a request naming no registered procedure
export enum UnhandledProcedureAction {
  // Passed on to the next handler, then to msw's own unhandled-request strategy
  Bypass = "Bypass",
  // Answered by tRPC with NOT_FOUND, which the client rejects with
  Error = "Error",
}
