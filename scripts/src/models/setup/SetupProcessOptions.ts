// How a process is started: through a shell where the platform needs one, and with its output read, or shown on the terminal when it is visible
export interface SetupProcessOptions {
  isThroughShell: boolean;
  isVisible: boolean;
}
