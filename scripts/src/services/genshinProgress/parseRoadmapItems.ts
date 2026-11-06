import type { GenshinRoadmapItem } from "#src/models/genshinProgress/GenshinRoadmapItem";
import type { GenshinRoadmapReading } from "#src/models/genshinProgress/GenshinRoadmapReading";

import { ROADMAP_PHASE_HEADING_REGEX } from "#src/services/genshinProgress/constants";

const HEADING_REGEX = /^## /u;
// A checkbox line is one roadmap item, ticked when its mark is an x
const ITEM_REGEX = /^- \[(?<mark>[ x])\] /u;
// The quest an item names, by the quest's id in the form `quest <id>`
const QUEST_REGEX = /\bquest (?<id>\d+)\b/u;

// The roadmap's items, each with the phase its heading names, whether it is ticked and the quest it names, and the name of
// Every phase
export const parseRoadmapItems = (text: string): GenshinRoadmapReading => {
  const items: GenshinRoadmapItem[] = [];
  const names = new Map<number, string>();
  let phase: number | undefined;
  for (const line of text.split("\n")) {
    const heading = ROADMAP_PHASE_HEADING_REGEX.exec(line)?.groups;
    const mark = ITEM_REGEX.exec(line)?.groups?.mark;
    if (heading !== undefined) {
      phase = Number(heading.phase);
      names.set(phase, heading.name ?? "");
    } else if (HEADING_REGEX.test(line)) phase = undefined;
    else if (mark !== undefined) items.push({ isDone: mark === "x", phase, quest: QUEST_REGEX.exec(line)?.groups?.id });
  }
  return { items, names };
};
