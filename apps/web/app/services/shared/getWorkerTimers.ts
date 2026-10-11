import { createWorkerTimers } from "@/services/shared/createWorkerTimers";
import TimerWorker from "@/workers/shared/timer.worker?worker";

// The worker is made on first use rather than when this module loads, since a server render loads it with no Worker
// To make
let workerTimers: ReturnType<typeof createWorkerTimers> | undefined;

export const getWorkerTimers = () => {
  workerTimers ??= createWorkerTimers(new TimerWorker());
  return workerTimers;
};
