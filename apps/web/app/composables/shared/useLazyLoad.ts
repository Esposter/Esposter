import { getResultAsync } from "@esposter/shared";

// Loads a value once the component mounts, so its code stays out of the eager graph and out of a server render. A load
// That fails is logged and reported as `isFailed`, which the component shows in place of what the value would draw
export const useLazyLoad = <T>(load: () => Promise<T>) => {
  const isFailed = ref(false);
  const loaded = shallowRef<T>();
  onMounted(async () => {
    await getResultAsync(load).match(
      (value) => {
        loaded.value = value;
      },
      (error) => {
        isFailed.value = true;
        console.error(error);
      },
    );
  });

  return { isFailed, loaded };
};
