// A hold's pid file on this machine, and whether the process it names is still running
export interface HoldFile {
  entry: string;
  isRunning: boolean;
  worker: string;
}
