import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { BUNDLE_SIZE_READ_BYTES } from "#src/services/bundleSizes/constants";
import { getBundleSizeKey } from "#src/services/bundleSizes/getBundleSizeKey";

interface RowMove {
  delta: number;
  line: string;
}

const formatDelta = (delta: number): string => (delta > 0 ? `+${delta}` : `${delta}`);

// One row's move, or nothing when its bytes did not change. A row only in `next` was added, and one only in `previous`
// Was removed, and both are marked to be read, as is a growth of at least `BUNDLE_SIZE_READ_BYTES`
const getRowMove = (previousRow: BundleSize | undefined, nextRow: BundleSize | undefined): RowMove | undefined => {
  if (previousRow && nextRow) {
    const delta = nextRow.bytes - previousRow.bytes;
    if (delta === 0) return undefined;

    const mark = delta >= BUNDLE_SIZE_READ_BYTES ? " (read)" : "";
    const line = `- ${nextRow.packageName} ${nextRow.file}: ${previousRow.bytes} -> ${nextRow.bytes} bytes (${formatDelta(delta)})${mark}`;
    return { delta, line };
  }
  if (nextRow)
    return {
      delta: nextRow.bytes,
      line: `- ${nextRow.packageName} ${nextRow.file}: added at ${nextRow.bytes} bytes (read)`,
    };
  if (previousRow)
    return {
      delta: -previousRow.bytes,
      line: `- ${previousRow.packageName} ${previousRow.file}: removed, was ${previousRow.bytes} bytes (read)`,
    };
  return undefined;
};

// The rows a record change moves, the largest move first, as the lines of its commit body. A reader checks each move
// Against the change that made it, and the marked ones first
export const renderBundleSizeChanges = (previous: BundleSize[], next: BundleSize[]): string[] => {
  const previousRows = new Map(previous.map((row) => [getBundleSizeKey(row), row]));
  const nextRows = new Map(next.map((row) => [getBundleSizeKey(row), row]));
  return Array.from(new Set([...previousRows.keys(), ...nextRows.keys()]), (key) =>
    getRowMove(previousRows.get(key), nextRows.get(key)),
  )
    .filter((move) => move !== undefined)
    .toSorted(
      (firstMove, secondMove) =>
        Math.abs(secondMove.delta) - Math.abs(firstMove.delta) || (firstMove.line < secondMove.line ? -1 : 1),
    )
    .map(({ line }) => line);
};
