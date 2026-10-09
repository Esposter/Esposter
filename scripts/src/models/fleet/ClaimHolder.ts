// The one worker process holding a claim: the machine it runs on, and the worker id that process was given. A machine
// Runs many workers, so a claim belongs to a worker, never to the machine alone
export interface ClaimHolder {
  machine: string;
  worker: string;
}
