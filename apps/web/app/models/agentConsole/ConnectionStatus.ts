export enum ConnectionStatus {
  Connected = "Connected",
  Connecting = "Connecting",
  // Paired, lost, and retrying — the page keeps what it has and reconnects on its own
  Disconnected = "Disconnected",
  Unpaired = "Unpaired",
}
