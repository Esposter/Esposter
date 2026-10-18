import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { QuestBanType, QuestObjectiveKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(readQuestSteps, () => {
  // A quest's file as the dump scrambles it: its sub quests under one name, each holding its id, its order, its words'
  // Hash and its finish conditions under names of their own, and a fail condition only one of them has
  const QUEST_ID = 1;
  const TEXT_HASH = 1000;
  const checkIsText = (hash: number) => hash === TEXT_HASH;

  test("a step whose sub quest names a ban group carries its ban type", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 100,
          C: 1,
          D: TEXT_HASH,
          E: [{ F: "QUEST_CONTENT_OBTAIN_ITEM", G: [0, 3] }],
          H: "BAN_GROUP_TRANSPORT_ONLY",
        },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [],
      offerTalkIds: [],
      steps: [
        {
          banType: QuestBanType.BanGroupTransportOnly,
          id: "100",
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "0" }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("a ban group the reader does not know is noted and left off the step", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_OBTAIN_ITEM", G: [0, 3] }], H: "BAN_GROUP_UNKNOWN" }],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [
        `${QUEST_ID}'s step 100 names a ban group the reader does not know, BAN_GROUP_UNKNOWN, so it is left off`,
      ],
      offerTalkIds: [],
      steps: [
        {
          id: "100",
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "0" }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("reads a step whose id is the quest's own id, as a city's opening sub quest's is", () => {
    expect.hasAssertions();

    const questBinary = { A: [{ B: 2001, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_COMPLETE_TALK", G: [0, 0] }] }] };

    expect(readQuestSteps(questBinary, 2001, checkIsText).steps).toStrictEqual([
      {
        id: "2001",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "0" }],
        textId: String(TEXT_HASH),
      },
    ]);
  });

  test("keeps every condition of a step that asks something, in the order the game lists them", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 100,
          C: 1,
          D: TEXT_HASH,
          E: [
            { F: "QUEST_CONTENT_OBTAIN_ITEM", G: [0, 3] },
            { F: "QUEST_CONTENT_COMPLETE_TALK", G: [0, 0] },
          ],
        },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [],
      offerTalkIds: [],
      steps: [
        {
          id: "100",
          objectives: [
            { count: 3, kind: QuestObjectiveKind.Collect, targetId: "0" },
            { count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "0" },
          ],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("reads the shown steps in their order, each with the conditions that ask something", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 101,
          C: 2,
          D: TEXT_HASH,
          E: [{ F: "QUEST_CONTENT_OBTAIN_ITEM", G: [0, 3] }],
          H: [{ F: "QUEST_CONTENT_TEAM_DEAD", G: [0, 0] }],
        },
        { B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_COMPLETE_TALK", G: [0, 0] }] },
        { B: 102, C: 3, E: [{ F: "QUEST_CONTENT_TRIGGER_FIRE", G: [0, 0] }] },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [],
      offerTalkIds: [],
      steps: [
        {
          id: "100",
          objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "0" }],
          textId: String(TEXT_HASH),
        },
        {
          id: "101",
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "0" }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("leaves out a talk-to objective whose talk the dump holds no lines for, noting it", () => {
    expect.hasAssertions();

    const questBinary = { A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_COMPLETE_TALK", G: [0, 0] }] }] };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText, () => false)).toStrictEqual({
      notes: [
        "1's talk 0 holds no lines in the dump, a scripted performance, so it is left out",
        "1's step 100 asks nothing of the Traveler its conditions name",
      ],
      offerTalkIds: [],
      steps: [],
    });
  });

  test("notes a shown step whose conditions ask nothing of the Traveler", () => {
    expect.hasAssertions();

    const questBinary = { A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_FINISH_PLOT", G: [0, 0] }] }] };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: ["1's step 100 asks nothing of the Traveler its conditions name"],
      offerTalkIds: [],
      steps: [],
    });
  });

  test("reads the talks a first step with no words finishes on as the talks offering the quest", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 100,
          C: 1,
          E: [
            { F: "QUEST_CONTENT_COMPLETE_TALK", G: [10, 0] },
            { F: "QUEST_CONTENT_COMPLETE_TALK", G: [11, 0] },
          ],
        },
        { B: 101, C: 2, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_COMPLETE_TALK", G: [12, 0] }] },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [],
      offerTalkIds: ["10", "11"],
      steps: [
        {
          id: "101",
          objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "12" }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });
});
