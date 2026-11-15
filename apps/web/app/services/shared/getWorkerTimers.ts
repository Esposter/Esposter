import { createWorkerTimers } from "#src/services/shared/createWorkerTimers";
import { takeOne } from "@esposter/shared";

// The worker is made on first use rather than when this module loads, since a server render loads it with no Worker
// To make
const TimerWorker = takeOne(
  Object.values(
    import.meta.glob<new () => Worker>("#src/workers/shared/timer.worker", {
      eager: true,
      import: "default",
      query: "?worker",
    }),
  ),
);
let workerTimers: ReturnType<typeof createWorkerTimers> | undefined;

export const getWorkerTimers = () => {
  workerTimers ??= createWorkerTimers(new TimerWorker());
  return workerTimers;
};
