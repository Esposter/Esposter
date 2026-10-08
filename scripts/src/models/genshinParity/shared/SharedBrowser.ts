// The shared browser `genshin:parity browser start` leaves in the parity tool's folder: the address of the Playwright
// Server holding it, which a command connects to, and the process holding the server, which `browser stop` ends
export interface SharedBrowser {
  processId: number;
  wsEndpoint: string;
}
