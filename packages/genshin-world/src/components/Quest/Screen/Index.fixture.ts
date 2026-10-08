import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The prologue's first Archon quest navigated to, a step on, and a world quest beside it a third of its way through
// Collecting, in the game's own English words for them
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  questProgressMap: new Map([
    ["0", { objectiveCounts: [1], stepIndex: 0 }],
    ["351", { objectiveCounts: [], stepIndex: 1 }],
  ]),
  quests: [
    {
      descriptionTextId: "351Description",
      id: "351",
      kind: QuestKind.Archon,
      steps: [
        { id: "35100", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "0" }], textId: "35100" },
        { id: "35101", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "0" }], textId: "35101" },
      ],
      talks: [],
      titleTextId: "351Title",
    },
    {
      descriptionTextId: "0Description",
      id: "0",
      kind: QuestKind.World,
      steps: [{ id: "0", objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "0" }], textId: "0" }],
      talks: [],
      titleTextId: "0Title",
    },
  ],
  textMap: {
    "0": "Collect all Eye of Graeae fragments",
    "0Description":
      "You must obtain the power that was separated from the Eye of Graeae so that the Eye can return and regain its body...",
    "0Title": "An Ark That Used to Be a Soul",
    "351Description":
      "The god took away your only kin, and you were sealed and cast into a deep slumber. Upon your awakening, you wandered alone for a time until you met a strange companion named Paimon, thus beginning your journey through the continent of Teyvat...",
    "351Title": "Wanderer's Trail",
    "35100": "Go to Paimon",
    "35101": "Follow Paimon",
  },
  trackedQuestId: "351",
};
