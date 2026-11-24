import type { TestSpecification } from "vitest/node";

import { testTimingsSchema } from "#src/models/TestTimings";
import { TEST_TIMINGS_PATH } from "#src/services/constants";
import { getTestTimingsKey } from "#src/services/getTestTimingsKey";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BaseSequencer } from "vitest/node";

// The shard each item runs on, by Graham's longest-processing-time rule: the items are taken longest first, each going
// To the shard with the least total so far, which lands within 4/3 of the best split. The order is fixed by the
// Duration and then the item's own index, so every shard computes the same assignment from the same durations
const getShardIndexes = (durations: number[], count: number): number[] => {
  const loads = Array.from({ length: count }, () => 0);
  const shardIndexes = Array.from(durations, () => 0);
  for (const itemIndex of durations
    .map((_duration, index) => index)
    .toSorted((left, right) => (durations[right] ?? 0) - (durations[left] ?? 0) || left - right)) {
    const shardIndex = loads.indexOf(Math.min(...loads));
    shardIndexes[itemIndex] = shardIndex;
    loads[shardIndex] = (loads[shardIndex] ?? 0) + (durations[itemIndex] ?? 0);
  }
  return shardIndexes;
};

// Code-unit order rather than `localeCompare`, so every shard sorts the same way whatever its locale
const compareText = (left: string, right: string): number => {
  if (left === right) return 0;
  return left < right ? -1 : 1;
};

// Splits the files over the shards by the durations the last run recorded rather than by count, so the slowest shard
// Is not the one that drew the heavy files. A file with no recorded duration counts as the mean of those with one, and
// With no timings at all the hash split stands. Every shard reads the same timings, so each computes the same split
export class DurationSequencer extends BaseSequencer {
  override async shard(files: TestSpecification[]): Promise<TestSpecification[]> {
    const { root, shard } = this.ctx.config;
    const timingsPath = resolve(root, TEST_TIMINGS_PATH);
    if (!shard || !existsSync(timingsPath)) return super.shard(files);
    /* oxlint-disable-next-line no-restricted-properties -- the timings carry no dates, and configuration builds before
       @esposter/shared so it cannot import jsonDateParse */
    const { projects } = testTimingsSchema.parse(JSON.parse(readFileSync(timingsPath, "utf8")));
    // By path and then project, a total order: the order the files were found in cannot change a shard's split
    const sortedFiles = files.toSorted(
      (left, right) => compareText(left.moduleId, right.moduleId) || compareText(left.project.name, right.project.name),
    );
    const durations = sortedFiles.map(
      ({ moduleId, project }) => projects[project.name]?.files?.[getTestTimingsKey(root, moduleId)]?.duration,
    );
    const recorded = durations.filter((duration) => duration !== undefined);
    if (recorded.length === 0) return super.shard(files);
    const mean = recorded.reduce((total, duration) => total + duration, 0) / recorded.length;
    const shardIndexes = getShardIndexes(
      durations.map((duration) => duration ?? mean),
      shard.count,
    );
    return sortedFiles.filter((_file, index) => shardIndexes[index] === shard.index - 1);
  }
}
