import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// A quest of one step going to one place, all the list shows of each quest but the one selected
const createQuest = (id: string, kind: QuestKind): Quest => ({
  descriptionTextId: id,
  id,
  kind,
  offerTalkIds: [],
  rewards: [],
  steps: [{ id, objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: id }], textId: id }],
  talks: [],
  titleTextId: id,
});

// The English client's quest screen as its still at 1920 by 1080 shows it (`File:Quest Screen.png`): the In Progress
// Tab, three commissions, and the World Quests' two Snezhnaya series with the quests the still shows of them, the world
// Quest under the last selected and navigated to, at its first step with none of its three fragments collected. The
// List opens at its top, where the still is scrolled down to its commissions, so only the quests it shows are held. The
// Text ids are readable names for this fixture alone, not the game's
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  questChapters: [
    {
      id: "hesperides-of-love-and-hate",
      journalTextId: "snezhnaya-adventure-journal",
      numberTextId: "",
      questIds: ["procrustes-iron-bed", "house-of-the-soulless", "the-suns-gilded-apple"],
      regionTextId: "snezhnaya",
      rewards: [],
      titleTextId: "hesperides-of-love-and-hate",
    },
    {
      id: "in-the-dwelling-of-life",
      journalTextId: "snezhnaya-adventure-journal",
      numberTextId: "",
      questIds: ["down-in-the-dumps", "an-ark-that-used-to-be-a-soul"],
      regionTextId: "snezhnaya",
      // Adventure EXP, Primogems, Mora, Hero's Wit and Mystic Enhancement Ore
      rewards: [
        { count: 350, itemId: 102, rarity: 3 },
        { count: 40, itemId: 201, rarity: 5 },
        { count: 30000, itemId: 202, rarity: 3 },
        { count: 4, itemId: 104003, rarity: 4 },
        { count: 4, itemId: 104013, rarity: 3 },
      ],
      titleTextId: "in-the-dwelling-of-life",
    },
  ] satisfies QuestChapter[],
  questDistanceMap: new Map([
    ["frost-collector", 1675],
    ["house-of-the-soulless", 1292],
    ["procrustes-iron-bed", 1209],
    ["spreading-evil", 1911],
    ["the-suns-gilded-apple", 1230],
    ["up-to-snow-good", 1544],
  ]),
  questProgressMap: new Map([["an-ark-that-used-to-be-a-soul", { objectiveCounts: [0], stepIndex: 0 }]]),
  quests: [
    createQuest("up-to-snow-good", QuestKind.Commission),
    createQuest("spreading-evil", QuestKind.Commission),
    createQuest("frost-collector", QuestKind.Commission),
    createQuest("procrustes-iron-bed", QuestKind.World),
    createQuest("house-of-the-soulless", QuestKind.World),
    createQuest("the-suns-gilded-apple", QuestKind.World),
    createQuest("down-in-the-dumps", QuestKind.World),
    {
      descriptionTextId: "eye-of-graeae",
      id: "an-ark-that-used-to-be-a-soul",
      kind: QuestKind.World,
      offerTalkIds: [],
      rewards: [],
      steps: [
        {
          id: "collect-fragments",
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "eye-of-graeae-fragment" }],
          textId: "collect-fragments",
        },
      ],
      talks: [],
      titleTextId: "an-ark-that-used-to-be-a-soul",
    },
  ] satisfies Quest[],
  textMap: {
    "an-ark-that-used-to-be-a-soul": "An Ark That Used to Be a Soul",
    "collect-fragments": "Collect all Eye of Graeae fragments",
    "down-in-the-dumps": "Down in the Dumps",
    "eye-of-graeae":
      "You must obtain the power that was separated from the Eye of Graeae so that the Eye can return and regain its body...",
    "frost-collector": "Frost Collector",
    "hesperides-of-love-and-hate": "Hesperides of Love and Hate",
    "house-of-the-soulless": "House of the Soulless",
    "in-the-dwelling-of-life": "In the Dwelling of Life",
    "procrustes-iron-bed": "Procrustes' Iron Bed",
    snezhnaya: "Snezhnaya",
    "snezhnaya-adventure-journal": "Snezhnaya Adventure Journal",
    "spreading-evil": "Spreading Evil",
    "the-suns-gilded-apple": "The Sun's Gilded Apple",
    "up-to-snow-good": "Up to Snow Good",
  },
  trackedQuestId: "an-ark-that-used-to-be-a-soul",
};
