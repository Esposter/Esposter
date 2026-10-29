// Whether a page started at a time predates a build of its packages: any build finished after it started
export const isPageStale = (startedAt: number, buildTimes: readonly number[]): boolean =>
  buildTimes.some((buildTime) => buildTime > startedAt);
