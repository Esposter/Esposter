import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";

// `- [ ] `[cpu]` {id} needs game-install, game-exports — the rest of the line`. The needs are optional: none means any
// Machine may take the item. Every compute-queue item belongs to the Genshin area, where the roadmap is kept
const ITEM_REGEX =
  /^- \[ \] `\[(?<lane>[a-z]+)\]` \{(?<id>[a-z0-9-]+)\}(?: needs (?<needs>[a-z-]+(?:, [a-z-]+)*))? — (?<rest>.*)$/u;
const WRITES_REGEX = /Writes (?<writes>.*)/u;
const SENTENCE_END_REGEX = /\.\s/u;
const BACKTICKED_REGEX = /`(?<token>[^`]+)`/gu;
const PATH_REGEX = /[./]/u;
const GENSHIN_AREA = "genshin";

// The paths an item writes: the backticked tokens in the sentence its `Writes` opens, so a prose mention of a constant
// Is not a path. A token with neither a slash nor a dot is a name rather than a file, and is left out
const readWrittenPaths = (rest: string): string[] => {
  const writesSentence = WRITES_REGEX.exec(rest)?.groups?.writes?.split(SENTENCE_END_REGEX)[0] ?? "";
  return Array.from(writesSentence.matchAll(BACKTICKED_REGEX), ({ groups }) => groups?.token ?? "").filter((token) =>
    PATH_REGEX.test(token),
  );
};

// One compute-queue line as a fleet entry, or undefined for a line that is not an item with an id
export const parseComputeQueueItem = (line: string): FleetEntry | undefined => {
  const groups = ITEM_REGEX.exec(line)?.groups;
  if (groups === undefined) return undefined;
  return {
    area: GENSHIN_AREA,
    id: groups.id ?? "",
    kind: FleetEntryKind.Queue,
    lane: groups.lane ?? "",
    needs: groups.needs?.split(", ") ?? [],
    touches: readWrittenPaths(groups.rest ?? ""),
  };
};
