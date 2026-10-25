import type { LoadBench } from "genshin-world/parity/models/LoadBench";

// The measures the load steps took, slowest first, each with the tiles it rebuilt when it rebuilt any
export const formatMeasures = ({ measures }: LoadBench): string[] =>
  measures
    .toSorted((firstMeasure, secondMeasure) => secondMeasure.duration - firstMeasure.duration)
    .map(
      ({ duration, isFailed, name, tileCount }) =>
        `  ${name.padEnd(24)} ${duration.toFixed(1)} ms${tileCount > 0 ? `, ${tileCount} tiles rebuilt` : ""}${isFailed ? " FAILED" : ""}`,
    );
