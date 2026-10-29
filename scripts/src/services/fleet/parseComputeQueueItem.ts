import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";
import { readWrittenPaths } from "#src/services/fleet/readWrittenPaths";

// `- [ ] `[cpu]` {id} needs game-install, game-exports — the rest of the line`. The needs are optional: none means any
// Machine may take the item. Every compute-queue item belongs to the Genshin area, where its compute pages are kept
const ITEM_REGEX =
  /^- \[ \] `\[(?<lane>[a-z]+)\]` \{(?<id>[a-z0-9-]+)\}(?: needs (?<needs>[a-z-]+(?:, [a-z-]+)*))? — (?<rest>.*)$/u;

// One compute-queue line as a fleet entry, or undefined for a line that is not an item with an id
export const parseComputeQueueItem = (line: string): FleetEntry | undefined => {
  const groups = ITEM_REGEX.exec(line)?.groups;
  if (groups === undefined) return undefined;
  return {
    area: GENSHIN_FLEET_AREA,
    id: groups.id ?? "",
    kind: FleetEntryKind.Queue,
    lane: groups.lane ?? "",
    line,
    needs: groups.needs?.split(", ") ?? [],
    touches: readWrittenPaths(groups.rest ?? ""),
    waiting: "",
  };
};
