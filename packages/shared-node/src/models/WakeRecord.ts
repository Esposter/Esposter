// What one test file leaves for the live topic wake check: the procedures it called and the procedures it watches.
// It counted what changed, reran and wrote.
// The writer is `apps/web/server/trpc/liveTopicWakeCheck.test.ts`.
// Every reader of the records goes through the `wake-check` entry this shape is exported from.
export interface WakeRecord {
  called: string[];
  counts: { changed: number; reruns: number; writes: number };
  file: string;
  watched: string[];
}
