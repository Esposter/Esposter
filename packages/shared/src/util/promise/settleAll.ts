import { toAppError } from "@/services/error/toAppError";
import { chunk } from "@/util/array/chunk";
import { takeOne } from "@/util/array/takeOne";
// Runs a fan-out to completion before raising anything, which is what every caller that rolls back on failure
// Needs: `Promise.all` hands the first rejection over while its siblings are still writing, so the rollback names
// A set that is still growing and whatever lands after it is referenced by nothing and reclaimed by nothing.
// Waves after a rejecting one never start, so the settled set stays complete and final either way.
// Nothing is discarded: a lone rejection is rethrown as-is, so callers keep the exact error they had before, and
// Several are carried together under the first one's message, since a multi-file failure whose other reasons are
// Dropped can only ever be diagnosed from whichever one happened to settle first.
export const settleAll = async <T>(
  tasks: (() => Promise<T>)[],
  concurrencyLimit: number = tasks.length,
): Promise<T[]> => {
  if (tasks.length === 0) return [];

  const values: T[] = [];
  for (const tasksChunk of chunk(tasks, concurrencyLimit)) {
    const results = await Promise.allSettled(tasksChunk.map((task) => task()));
    const reasons: unknown[] = [];
    for (const result of results)
      if (result.status === "rejected") reasons.push(result.reason);
      else values.push(result.value);
    if (reasons.length === 1) throw takeOne(reasons);
    else if (reasons.length > 1) throw new AggregateError(reasons, toAppError(takeOne(reasons)).message);
  }
  return values;
};
