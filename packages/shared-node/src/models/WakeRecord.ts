// What one test file leaves for the live topic wake check: the procedures it called, the procedures it watches and what it
// Counted. The writer is `apps/web/server/trpc/liveTopicWakeCheck.test.ts`, and every reader of the records goes through
// The `wake-check` entry this shape is exported from
export interface WakeRecord {
  called: string[];
  counts: { changed: number; reruns: number; writes: number };
  file: string;
  watched: string[];
}
