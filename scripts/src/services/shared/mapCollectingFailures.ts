import { InvalidOperationError, Operation } from "@esposter/shared";

// Each item mapped in turn, a failure set aside rather than thrown at the first, so that when any item fails one error
// Names every item that did, with its own message. The results come back only when none fails, `subject` naming what
// Was being built
export const mapCollectingFailures = <T, U>(subject: string, items: readonly T[], map: (item: T) => U): U[] => {
  const results: U[] = [];
  const failures: string[] = [];
  for (const item of items)
    try {
      results.push(map(item));
    } catch (error) {
      failures.push(`${String(item)}: ${error instanceof Error ? error.message : String(error)}`);
    }
  if (failures.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      subject,
      `fails on ${failures.length} of ${items.length}:\n${failures.join("\n")}`,
    );
  return results;
};
