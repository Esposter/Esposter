import { getResultAsync } from "@esposter/shared";

// Reads each item it can, and names each it cannot by its own name and the reason, so one item that cannot be read never
// Stops the rest from being read. Each failure is logged as it is named
export const settleEach = async <TItem, TResult>(
  items: readonly TItem[],
  getName: (item: TItem) => string,
  read: (item: TItem) => Promise<TResult>,
): Promise<{ failures: string[]; results: TResult[] }> => {
  const settled = await Promise.all(
    items.map((item) =>
      getResultAsync(() => read(item)).match(
        (result) => ({ result }),
        (error) => {
          console.error(error);
          return { failure: `${getName(item)}: ${error.message}` };
        },
      ),
    ),
  );
  return {
    failures: settled.flatMap((entry) => ("failure" in entry ? [entry.failure] : [])),
    results: settled.flatMap((entry) => ("result" in entry ? [entry.result] : [])),
  };
};
