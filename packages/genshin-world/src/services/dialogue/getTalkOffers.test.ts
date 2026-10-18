import type { Quest } from "#src/models/quest/Quest";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { TALK } from "#src/services/dialogue/constants.test";
import { getTalkOffers } from "#src/services/dialogue/getTalkOffers";
import { DialogueChoiceIcon } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(getTalkOffers, () => {
  // A world quest whose one step asks for the sample talk, begun on character 0
  const NPC_ID = "0";
  const QUEST: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "id",
    kind: QuestKind.World,
    mainId: "id",
    offerTalkIds: [],
    rewards: [],
    steps: [
      { id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: TALK.id }], textId: "textId" },
    ],
    talks: [{ ...TALK, npcIds: [NPC_ID] }],
    titleTextId: "titleTextId",
  };
  const STARTED_PROGRESS_MAP = new Map([[QUEST.id, { objectiveCounts: [], stepIndex: 0 }]]);

  test("offers the talk the quest's step asks for, named by the quest's title", () => {
    expect.hasAssertions();

    expect(getTalkOffers([QUEST], STARTED_PROGRESS_MAP, [NPC_ID])).toStrictEqual([
      { icon: DialogueChoiceIcon.Quest, talkId: TALK.id, textId: QUEST.titleTextId },
    ]);
  });

  test("offers a story quest's talk with the story quest's mark", () => {
    expect.hasAssertions();

    expect(getTalkOffers([{ ...QUEST, kind: QuestKind.Story }], STARTED_PROGRESS_MAP, [NPC_ID])).toStrictEqual([
      { icon: DialogueChoiceIcon.StoryQuest, talkId: TALK.id, textId: QUEST.titleTextId },
    ]);
  });

  test("offers the talk offering a quest until the quest starts, then its step's talk", () => {
    expect.hasAssertions();

    const offerTalk = { ...TALK, id: "offer", npcIds: [NPC_ID] };
    const offeredQuest = { ...QUEST, offerTalkIds: [offerTalk.id], talks: [...QUEST.talks, offerTalk] };

    expect(getTalkOffers([offeredQuest], new Map(), [NPC_ID])).toStrictEqual([
      { icon: DialogueChoiceIcon.Quest, talkId: offerTalk.id, textId: QUEST.titleTextId },
    ]);
    expect(getTalkOffers([offeredQuest], STARTED_PROGRESS_MAP, [NPC_ID])).toStrictEqual([
      { icon: DialogueChoiceIcon.Quest, talkId: TALK.id, textId: QUEST.titleTextId },
    ]);
  });

  test.each([
    ["a talk already had", new Map([[QUEST.id, { objectiveCounts: [1], stepIndex: 0 }]]), NPC_ID],
    ["a quest not yet started that no talk offers", new Map(), NPC_ID],
    ["a talk begun on another character", STARTED_PROGRESS_MAP, "1"],
  ])("offers nothing for %s", (_description, questProgressMap, npcId) => {
    expect.hasAssertions();

    expect(getTalkOffers([QUEST], questProgressMap, [npcId])).toStrictEqual([]);
  });
});
