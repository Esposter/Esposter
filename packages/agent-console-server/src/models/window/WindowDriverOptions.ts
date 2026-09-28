import type { SessionWindowLaunch } from "#src/models/window/SessionWindowLaunch";

export interface WindowDriverOptions {
  // Starts a session's window, which connects back under the launch's secret
  launchSessionWindow: (sessionWindowLaunch: SessionWindowLaunch) => void;
  // Where the host keeps the windows it holds, for a host started after it went away
  stateDirectory: string;
  // A line in the host's own window
  writeLine: (line: string) => void;
}
