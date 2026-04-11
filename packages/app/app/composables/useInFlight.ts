export const useInFlight = () => {
  const isLoading = ref(false);
  const execute = async <T>(fn: () => Promise<T>): Promise<void> => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      await fn();
    } finally {
      isLoading.value = false;
    }
  };
  return { execute, isLoading };
};
