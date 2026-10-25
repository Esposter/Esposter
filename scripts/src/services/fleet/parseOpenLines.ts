import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { parseComputeQueueItem } from "#src/services/fleet/parseComputeQueueItem";

const OPEN_LINE_PREFIX = "- [ ] ";

// Every open line of a section, parsed: an item, or undefined for an open line with no id
export const parseOpenLines = (text: string): (FleetEntry | undefined)[] =>
  text
    .split("\n")
    .filter((line) => line.startsWith(OPEN_LINE_PREFIX))
    .map((line) => parseComputeQueueItem(line));
