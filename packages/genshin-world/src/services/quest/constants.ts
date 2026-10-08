import { QuestCategory } from "#src/models/quest/QuestCategory";

// The quest screen's tabs after its first, which lists every quest, in the order the game draws them and its list's
// Headings run
export const QUEST_CATEGORIES: readonly QuestCategory[] = [
  QuestCategory.Archon,
  QuestCategory.Story,
  QuestCategory.Commission,
  QuestCategory.World,
];
// The keys the quest screen steps between its tabs with, by their physical code, as its Q and E marks show
export const QUEST_TAB_PREVIOUS_CODE = "KeyQ";
export const QUEST_TAB_NEXT_CODE = "KeyE";
// The navigation's beam rises over its objective only from this far off, in metres, as the wiki has it
export const QUEST_BEAM_MIN_DISTANCE = 50;
// Provisional: the beam's radius and colour, until the parity pass reads them off a recording of the English client
// Navigating to an objective. It reaches from under the lowest ground to over the highest peak, so it rises out of the
// Ground wherever it stands with no height read for it
export const QUEST_BEAM_RADIUS = 0.6;
export const QUEST_BEAM_COLOR = "#ffd780";
export const QUEST_BEAM_BOTTOM = -200;
export const QUEST_BEAM_TOP = 1000;
