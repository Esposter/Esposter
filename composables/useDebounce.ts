export const useDebounce = <TArgs extends unknown[]>(fn: (...args: TArgs) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: TArgs) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
