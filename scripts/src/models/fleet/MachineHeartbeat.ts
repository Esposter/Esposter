import type { LastPush } from "#src/models/shared/LastPush";

// The message of a machine's heartbeat commit under `refs/machines/<id>`. `gpu` is undefined when no reader measured it,
// `platform` is the process platform of the machine that wrote it, undefined on a heartbeat an older watcher pushed, and
// `lastPush` is the last commit that machine landed on the queue, undefined until it has landed one
export interface MachineHeartbeat {
  at: string;
  cpu: number;
  freeMemory: number;
  gpu?: number;
  lastPush?: LastPush;
  machine: string;
  platform?: NodeJS.Platform;
}
