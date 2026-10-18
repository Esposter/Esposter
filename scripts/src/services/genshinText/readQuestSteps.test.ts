import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { formatQuestWaitTargetId, QuestBanType, QuestObjectiveKind } from "genshin-world";
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
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetIds: ["0"] }],
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
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetIds: ["0"] }],
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
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["0"] }],
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
            { count: 3, kind: QuestObjectiveKind.Collect, targetIds: ["0"] },
            { count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["0"] },
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
          objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["0"] }],
          textId: String(TEXT_HASH),
        },
        {
          id: "101",
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetIds: ["0"] }],
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

    const questBinary = { A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_LUA_NOTIFY", G: [0, 0] }] }] };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: ["1's step 100 asks nothing of the Traveler its conditions name"],
      offerTalkIds: [],
      steps: [],
    });
  });

  test("reads the shown steps of a quest whose one sub quest holds no condition, noting that one", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        { B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_COMPLETE_TALK", G: [0, 0] }] },
        { B: 101, C: 2, D: TEXT_HASH },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: ["1's step 101 asks nothing of the Traveler its conditions name"],
      offerTalkIds: [],
      steps: [
        {
          id: "100",
          objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["0"] }],
          textId: String(TEXT_HASH),
        },
      ],
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
          objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["12"] }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("a step whose guide names an NPC carries the NPC's id", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 100,
          C: 1,
          D: TEXT_HASH,
          E: [{ F: "QUEST_CONTENT_TRIGGER_FIRE", G: ["7"] }],
          H: { I: "QUEST_GUIDE_NPC", J: ["42"] },
        },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [],
      offerTalkIds: [],
      steps: [
        {
          guideNpcId: "42",
          id: "100",
          objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetIds: ["7"] }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("plot that is a talk", () => {
    expect.hasAssertions();

    const questBinary = { A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_FINISH_PLOT", G: [7, 0] }] }] };

    expect(
      readQuestSteps(
        questBinary,
        QUEST_ID,
        checkIsText,
        () => true,
        (talkId) => talkId === "7",
      ).steps,
    ).toStrictEqual([
      {
        id: "100",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7"] }],
        textId: String(TEXT_HASH),
      },
    ]);
  });

  test("plot the world cannot play", () => {
    expect.hasAssertions();

    const questBinary = { A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_FINISH_PLOT", G: [7, 0] }] }] };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [`${QUEST_ID}'s step 100 finishes on a plot the world cannot play, so it is met at once`],
      offerTalkIds: [],
      steps: [
        {
          id: "100",
          objectives: [{ count: 1, kind: QuestObjectiveKind.Plot, targetIds: ["7"] }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("scene named", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_PRESENT_AT_SPECIFIC_SCENE", G: [9, 0] }] }],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText).steps).toStrictEqual([
      {
        id: "100",
        objectives: [{ count: 1, kind: QuestObjectiveKind.Scene, targetIds: ["9"] }],
        textId: String(TEXT_HASH),
      },
    ]);
  });

  test("wait window read", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_GAME_TIME_TICK", G: [1, 0], H: "09,11" }] }],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText).steps).toStrictEqual([
      {
        id: "100",
        objectives: [
          {
            count: 1,
            kind: QuestObjectiveKind.Wait,
            targetIds: [formatQuestWaitTargetId({ days: 1, fromHour: 9, toHour: 11 })],
          },
        ],
        textId: String(TEXT_HASH),
      },
    ]);
  });

  test("alternative ticks merged", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 100,
          C: 1,
          D: TEXT_HASH,
          E: [
            { F: "QUEST_CONTENT_GAME_TIME_TICK", G: [0, 0], H: "6,9" },
            { F: "QUEST_CONTENT_GAME_TIME_TICK", G: [1, 0], H: "18,6" },
          ],
        },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText).steps).toStrictEqual([
      {
        id: "100",
        objectives: [
          {
            count: 1,
            kind: QuestObjectiveKind.Wait,
            targetIds: [
              formatQuestWaitTargetId({ days: 0, fromHour: 6, toHour: 9 }),
              formatQuestWaitTargetId({ days: 1, fromHour: 18, toHour: 6 }),
            ],
          },
        ],
        textId: String(TEXT_HASH),
      },
    ]);
  });

  test("unreadable window left out", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 100,
          C: 1,
          D: TEXT_HASH,
          E: [
            { F: "QUEST_CONTENT_GAME_TIME_TICK", G: [0, 0], H: "6,25" },
            { F: "QUEST_CONTENT_GAME_TIME_TICK", G: [0, 0] },
          ],
        },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: ["1's step 100 asks nothing of the Traveler its conditions name"],
      offerTalkIds: [],
      steps: [],
    });
  });

  test("hidden step stays out", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        { B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_COMPLETE_TALK", G: [0, 0] }] },
        { B: 101, C: 2, E: [{ F: "QUEST_CONTENT_FINISH_PLOT", G: [7, 0] }] },
        { B: 102, C: 3, E: [{ F: "QUEST_CONTENT_PRESENT_AT_SPECIFIC_SCENE", G: [9, 0] }] },
        { B: 103, C: 4, E: [{ F: "QUEST_CONTENT_GAME_TIME_TICK", G: [0, 0], H: "0,24" }] },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText).steps.map(({ id }) => id)).toStrictEqual(["100"]);
  });
});
