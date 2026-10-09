import type { SyncQueueInput } from "#src/models/coderabbit/collect/SyncQueueInput";

// The queue's rewrite at HEAD, pushed under a lease on the sha the run read
export type QueueRewriteInput = Pick<SyncQueueInput, "cwd" | "isDryRun" | "queueSha" | "viewerLogin">;
