import type { LastPush } from "#src/models/queue/LastPush";

// The message of a machine's heartbeat commit under `refs/machines/<id>`. `gpu` is undefined when no reader measured it,
// `platform` is the process platform of the machine that wrote it, undefined on a heartbeat an older watcher pushed, and
// `lastPush` is the last push that machine recorded, undefined until it has pushed a commit of the queue
export interface MachineHeartbeat {
  at: string;
  cpu: number;
  freeMemory: number;
  gpu?: number;
  lastPush?: LastPush;
  machine: string;
  platform?: NodeJS.Platform;
}
