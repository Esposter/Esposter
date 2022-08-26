export const useDebounce = <TArgs extends unknown[]>(fn: (...args: TArgs) => void, delay: number) => {
  let timeoutId: number;
  return (...args: TArgs) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
};
