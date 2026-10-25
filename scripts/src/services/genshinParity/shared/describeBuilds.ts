import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";

import { roundMs } from "#src/services/genshinParity/shared/roundMs";

const LISTED_BUILDS_PER_STATE = 12;

// The node materials a state built, one line a material and object, most time first, so a build the state should not
// Have made is named by what it was built for
export const describeBuilds = (calls: GpuCall[]): string[] => {
  const builds = new Map<string, { count: number; ms: number }>();
  for (const call of calls) {
    if (call.name !== "buildNodes") continue;
    const key = `${call.label} | ${call.detail}`;
    const total = builds.get(key) ?? { count: 0, ms: 0 };
    builds.set(key, { count: total.count + 1, ms: total.ms + call.duration });
  }

  return [...builds]
    .toSorted(([, firstBuild], [, secondBuild]) => secondBuild.ms - firstBuild.ms)
    .slice(0, LISTED_BUILDS_PER_STATE)
    .map(([key, { count, ms }]) => `  built ${count}x for ${roundMs(ms)} ms: ${key}`);
};
