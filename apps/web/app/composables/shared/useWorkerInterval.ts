import { clearInterval, setInterval } from "worker-timers";

// The interval lives in a Web Worker so it keeps firing while the tab is backgrounded,
// Where browsers throttle main-thread timers
export const useWorkerInterval = (callback: () => void, intervalMs: number) => {
  let intervalId: number | undefined;

  onMounted(() => {
    intervalId = setInterval(callback, intervalMs);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });
};
