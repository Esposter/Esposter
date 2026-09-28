// Why the host closed a session's window's socket, in the range WebSocket leaves to applications. Any other close — the
// Host's process killed, as a rebuild while developing does — leaves the window's session running for the next host
export enum SessionWindowCloseCode {
  // The session was ended on purpose: closed from a page, or the host stopped from its own window
  SessionEnded = 4000,
}
