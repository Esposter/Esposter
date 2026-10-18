import { getResultAsync } from "@esposter/shared";

// Every item read in full, each one that fails named by its name and skipped, so a failure never stops the rest from being
// Read. The values and the failures keep the items' order
export const settleEachNamed = async <TItem, TValue>(
  items: readonly TItem[],
  getName: (item: TItem) => string,
  read: (item: TItem) => Promise<TValue>,
): Promise<{ failures: string[]; values: TValue[] }> => {
  const results = await Promise.all(
    items.map((item) =>
      getResultAsync(() => read(item)).match(
        (value) => ({ value }),
        (error) => {
          console.error(error);
          return { failure: `${getName(item)}: ${error.message}` };
        },
      ),
    ),
  );
  return {
    failures: results.flatMap((result) => ("failure" in result ? [result.failure] : [])),
    values: results.flatMap((result) => ("value" in result ? [result.value] : [])),
  };
};
