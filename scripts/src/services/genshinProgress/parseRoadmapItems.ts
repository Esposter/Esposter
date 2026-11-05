import type { GenshinRoadmapItem } from "#src/models/genshinProgress/GenshinRoadmapItem";
import type { GenshinRoadmapReading } from "#src/models/genshinProgress/GenshinRoadmapReading";

// A phase heading names its phase and the phase's name. Any other level-two heading ends the phase, so a checkbox under
// No phase heading is an item of no phase
const PHASE_HEADING_REGEX = /^## Phase (?<phase>[0-7]): (?<name>.+)$/u;
const HEADING_REGEX = /^## /u;
// A checkbox line is one roadmap item, ticked when its mark is an x
const ITEM_REGEX = /^- \[(?<mark>[ x])\] /u;

// The roadmap's items, each with the phase its heading names and whether it is ticked, and the name of every phase
export const parseRoadmapItems = (text: string): GenshinRoadmapReading => {
  const items: GenshinRoadmapItem[] = [];
  const names = new Map<number, string>();
  let phase: number | undefined;
  for (const line of text.split("\n")) {
    const heading = PHASE_HEADING_REGEX.exec(line)?.groups;
    const mark = ITEM_REGEX.exec(line)?.groups?.mark;
    if (heading !== undefined) {
      phase = Number(heading.phase);
      names.set(phase, heading.name ?? "");
    } else if (HEADING_REGEX.test(line)) phase = undefined;
    else if (mark !== undefined) items.push({ isDone: mark === "x", phase });
  }
  return { items, names };
};
