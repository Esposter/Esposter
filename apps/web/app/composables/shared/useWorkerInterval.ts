import { getWorkerTimers } from "@/services/shared/getWorkerTimers";

// The interval lives in a Web Worker so it keeps firing while the tab is backgrounded,
// Where browsers throttle main-thread timers
export const useWorkerInterval = (callback: () => void, intervalMs: number) => {
  let intervalId: number | undefined;

  onMounted(() => {
    intervalId = getWorkerTimers().setInterval(() => {
      callback();
    }, intervalMs);
  });

  onUnmounted(() => {
    if (intervalId) getWorkerTimers().clearInterval(intervalId);
  });
};
