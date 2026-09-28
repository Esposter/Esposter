// A shell running on a host, opened in one of its sessions' working directory
export interface Shell {
  connectionId: string;
  id: string;
  sessionId: string;
}
