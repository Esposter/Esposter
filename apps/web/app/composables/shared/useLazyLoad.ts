import { getResultAsync } from "@esposter/shared";

// Loads a value once the component mounts, so its code stays out of the eager graph and out of a server render. A load
// That fails is logged and reported as `isFailed`, which the component shows in place of what the value would draw.
// A component unmounted before its load settles aborts the signal the load is handed and drops the outcome, so a load
// Still running never draws into an element a remount of the same component has since taken over
export const useLazyLoad = <T>(load: (signal: AbortSignal) => Promise<T>) => {
  const isFailed = ref(false);
  const loaded = shallowRef<T>();
  const abortController = new AbortController();
  onMounted(async () => {
    await getResultAsync(() => load(abortController.signal)).match(
      (value) => {
        if (!abortController.signal.aborted) loaded.value = value;
      },
      (error) => {
        if (abortController.signal.aborted) return;
        isFailed.value = true;
        console.error(error);
      },
    );
  });
  onUnmounted(() => {
    abortController.abort();
  });

  return { isFailed, loaded };
};
