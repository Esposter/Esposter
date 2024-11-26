import type { WatchCallback, WatchOptions, WatchSource } from "vue";

import { dayjs } from "@/shared/services/dayjs";

export const watchTracker = <T>(
  source: WatchSource<T>,
  callback: WatchCallback<T, T | undefined>,
  options?: WatchOptions,
) => {
  const isTrackerInitialized = ref(false);
  const watchStopHandlers = [
    watch(isTrackerInitialized, (newIsTrackerInitialized) => {
      if (!newIsTrackerInitialized) return;
      watchStopHandlers.push(
        watchDebounced(source, callback, {
          debounce: dayjs.duration(0.5, "seconds").asMilliseconds(),
          maxWait: dayjs.duration(1, "second").asMilliseconds(),
        }),
      );
    }),
    watchOnce(
      source,
      () => {
        // For trackers which track diffs usually for saving,
        // we ignore the first change which is due to initialisation
        isTrackerInitialized.value = true;
      },
      options,
    ),
  ];
  return watchStopHandlers;
};
