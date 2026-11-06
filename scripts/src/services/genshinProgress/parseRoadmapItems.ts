import type { GenshinRoadmapItem } from "#src/models/genshinProgress/GenshinRoadmapItem";
import type { GenshinRoadmapReading } from "#src/models/genshinProgress/GenshinRoadmapReading";

import { QUEST_ID_PATTERN } from "#src/services/genshinProgress/constants";
import { readRoadmapPhaseHeading } from "#src/services/genshinProgress/readRoadmapPhaseHeading";

// A checkbox line is one roadmap item, ticked when its mark is an x
const ITEM_REGEX = /^- \[(?<mark>[ x])\] /u;
// The quest an item names, as a whole word
const QUEST_REGEX = new RegExp(String.raw`\b${QUEST_ID_PATTERN}\b`, "u");

// The roadmap's items, each with the phase its heading names, whether it is ticked and the quest it names, and the name of
// Every phase
export const parseRoadmapItems = (text: string): GenshinRoadmapReading => {
  const items: GenshinRoadmapItem[] = [];
  const names = new Map<number, string>();
  let phase: number | undefined;
  for (const line of text.split("\n")) {
    const heading = readRoadmapPhaseHeading(line);
    const mark = ITEM_REGEX.exec(line)?.groups?.mark;
    if (heading !== undefined) {
      phase = heading.phase;
      names.set(phase, heading.name);
    } else if (line.startsWith("## ")) phase = undefined;
    else if (mark !== undefined) items.push({ isDone: mark === "x", phase, quest: QUEST_REGEX.exec(line)?.groups?.id });
  }
  return { items, names };
};
