import { InvalidOperationError, Operation } from "@esposter/shared";

const RANGE_SEGMENT_REGEX = /^(?<start>\d+)-(?<end>\d+)$/u;

// The part of an overlay entry the expansion reads: a cited entry names its file, and carries a value for each hit of a run
interface KitOverlayRangeEntry {
  file?: string;
  index?: number;
  value?: unknown;
}

// An overlay key may name a run of consecutive hits, `hits.fatalBlossoms.0-6.hitmarkFrames`, which expands to one key per
// Hit. A cited entry's array gives one value per hit, so each hit takes its own element and its position in the run as its
// Index, which the cited reader matches against the loop's element at that index; any other entry is shared by the run
export const expandKitOverlay = <Entry extends KitOverlayRangeEntry>(
  overlay: Record<string, Entry>,
): Record<string, Entry> => {
  const expanded: Record<string, Entry> = {};
  for (const [path, entry] of Object.entries(overlay)) {
    const segments = path.split(".");
    const rangeIndex = segments.findIndex((segment) => RANGE_SEGMENT_REGEX.test(segment));
    const range = RANGE_SEGMENT_REGEX.exec(segments[rangeIndex] ?? "");
    if (range?.groups === undefined) {
      expanded[path] = entry;
      continue;
    }
    const start = Number(range.groups.start);
    const count = Number(range.groups.end) - start + 1;
    const { value } = entry;
    if (entry.file === undefined || !Array.isArray(value)) {
      for (let hit = 0; hit < count; hit++) expanded[segments.with(rangeIndex, String(start + hit)).join(".")] = entry;
      continue;
    }
    if (value.length !== count)
      throw new InvalidOperationError(
        Operation.Read,
        path,
        `cites ${value.length} values for ${count} hits, one per hit of its run`,
      );
    for (let hit = 0; hit < count; hit++)
      expanded[segments.with(rangeIndex, String(start + hit)).join(".")] = { ...entry, index: hit, value: value[hit] };
  }
  return expanded;
};
