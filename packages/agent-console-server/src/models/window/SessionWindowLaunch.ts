// What a session's window needs to reach the host: the loopback port the host listens for windows on, and the secret
// That admits this one window, once
export interface SessionWindowLaunch {
  port: number;
  secret: string;
}
