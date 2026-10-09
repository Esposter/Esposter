// The message of a machine's heartbeat commit under `refs/machines/<id>`. `gpu` is undefined when no reader measured it
export interface MachineHeartbeat {
  at: string;
  cpu: number;
  freeMemory: number;
  gpu?: number;
  machine: string;
}
