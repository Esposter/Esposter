export enum ConnectionStatus {
  Connected = "Connected",
  Connecting = "Connecting",
  // Paired, lost, and retrying — the page keeps what it has and reconnects on its own
  Disconnected = "Disconnected",
  // Paired, and stopped on purpose from the host's own window: the page does not retry until it is asked to
  Stopped = "Stopped",
  Unpaired = "Unpaired",
}
