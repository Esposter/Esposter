import type { TupleSlice } from "@/util/types/TupleSlice";
import type { WatchSource } from "vue";

export const watchTracker = (source: WatchSource<object>, ...args: TupleSlice<Parameters<typeof watch>, 1>) => {
  const [cb, options] = args;
  const isTrackerInitialized = ref(false);
  return [
    watchOnce(
      source,
      () => {
        // For trackers which track diffs usually for saving,
        // we ignore the first change which is due to initialisation
        isTrackerInitialized.value = true;
      },
      options,
    ),
    watchDebounced(source, (...args) => {
      if (!isTrackerInitialized.value) return;
      cb(...args);
    }),
  ];
};
