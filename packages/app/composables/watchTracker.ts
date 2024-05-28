export const watchTracker = (...args: Parameters<typeof watch>): ReturnType<typeof watch> => {
  const [source, cb, options] = args;
  const isTrackerInitialized = ref(false);
  return watch(
    source,
    (...args) => {
      // For trackers which track diffs usually for saving,
      // we ignore the first change which is due to initialisation
      if (!isTrackerInitialized.value) {
        isTrackerInitialized.value = true;
        return;
      }
      cb(...args);
    },
    options,
  );
};
