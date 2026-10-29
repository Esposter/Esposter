import type { DevNameResolution } from "#src/models/dev/DevNameResolution";

import { MAX_DEV_NAME_SUGGESTION_COUNT } from "#src/services/dev/constants";
import { takeOne } from "@esposter/shared";

// The entry a line's name names: the one whose name is the name, ignoring case, else the only one whose name holds it. A
// Name several entries hold is refused with the nearest names, and one none holds as unknown
export const resolveDevName = <TEntry>(
  entries: readonly TEntry[],
  getName: (entry: TEntry) => string,
  name: string,
  kind: string,
): DevNameResolution<TEntry> => {
  const lowerName = name.toLowerCase();
  const matchingEntries = entries.filter((entry) => getName(entry).toLowerCase().includes(lowerName));
  const exactEntry = matchingEntries.find((entry) => getName(entry).toLowerCase() === lowerName);
  if (exactEntry !== undefined) return { entry: exactEntry, ok: true };
  if (matchingEntries.length === 1) return { entry: takeOne(matchingEntries, 0), ok: true };
  if (matchingEntries.length === 0) return { error: `unknown ${kind} ${name}`, ok: false };

  const nearestNames = [...new Set(matchingEntries.map((entry) => getName(entry)))].slice(
    0,
    MAX_DEV_NAME_SUGGESTION_COUNT,
  );
  return { error: `${name} names more than one ${kind}; did you mean ${nearestNames.join(", ")}?`, ok: false };
};
