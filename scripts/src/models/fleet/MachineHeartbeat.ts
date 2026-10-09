// The message of a machine's heartbeat commit under `refs/machines/<id>`. `gpu` is undefined when no reader measured it,
// And `platform` is the process platform of the machine that wrote it, undefined on a heartbeat an older watcher pushed
export interface MachineHeartbeat {
  at: string;
  cpu: number;
  freeMemory: number;
  gpu?: number;
  machine: string;
  platform?: NodeJS.Platform;
}
