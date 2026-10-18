import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { startQuests } from "#src/services/quest/startQuests";
import { describe, expect, test } from "vitest";

const createQuest = (id: string): Quest => ({
  descriptionTextId: "descriptionTextId",
  id,
  kind: QuestKind.Archon,
  mainId: id,
  offerTalkIds: [],
  parentQuestIds: [],
  rewards: [],
  steps: [{ id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetIds: ["0"] }], textId: "textId" }],
  talks: [],
  titleTextId: "titleTextId",
});

describe(startQuests, () => {
  const quests = [createQuest("1"), createQuest("2")];

  test("starts the first Archon quest not yet finished, once", () => {
    expect.hasAssertions();

    const started = startQuests(quests, new Map());

    expect(started).toStrictEqual(new Map([["1", { objectiveCounts: [], stepIndex: 0 }]]));
    expect(startQuests(quests, started)).toStrictEqual(started);
  });

  test("starts the next Archon quest once the one before it is finished", () => {
    expect.hasAssertions();

    expect(startQuests(quests, new Map([["1", { objectiveCounts: [], stepIndex: 1 }]]))).toStrictEqual(
      new Map([
        ["1", { objectiveCounts: [], stepIndex: 1 }],
        ["2", { objectiveCounts: [], stepIndex: 0 }],
      ]),
    );
  });

  test("starts a quest a talk offers once that talk ends, and only the once", () => {
    expect.hasAssertions();

    const offeredQuest: Quest = { ...createQuest("3"), kind: QuestKind.World, offerTalkIds: ["offer"] };
    const talkEvent = { kind: QuestObjectiveKind.TalkTo, targetId: "offer" };
    const started = startQuests([offeredQuest], new Map(), talkEvent);

    expect(startQuests([offeredQuest], new Map())).toStrictEqual(new Map());
    expect(startQuests([offeredQuest], new Map(), { ...talkEvent, kind: QuestObjectiveKind.Interact })).toStrictEqual(
      new Map(),
    );
    expect(started).toStrictEqual(new Map([["3", { objectiveCounts: [], stepIndex: 0 }]]));
    expect(
      startQuests([offeredQuest], new Map([["3", { objectiveCounts: [], stepIndex: 1 }]]), talkEvent),
    ).toStrictEqual(new Map([["3", { objectiveCounts: [], stepIndex: 1 }]]));
  });

  const seriesQuests: Quest[] = [
    { ...createQuest("1"), kind: QuestKind.World, offerTalkIds: ["first"] },
    { ...createQuest("2"), kind: QuestKind.World, offerTalkIds: ["second"] },
  ];
  const chapter: QuestChapter = {
    id: "chapter",
    journalTextId: "journalTextId",
    numberTextId: "numberTextId",
    questIds: ["1", "2"],
    regionTextId: "regionTextId",
    rewards: [],
    titleTextId: "titleTextId",
  };
  const secondTalkEvent = { kind: QuestObjectiveKind.TalkTo, targetId: "second" };

  test("the next quest is offered once the one before is finished", () => {
    expect.hasAssertions();

    expect(
      startQuests(seriesQuests, new Map([["1", { objectiveCounts: [], stepIndex: 1 }]]), secondTalkEvent, [chapter]),
    ).toStrictEqual(
      new Map([
        ["1", { objectiveCounts: [], stepIndex: 1 }],
        ["2", { objectiveCounts: [], stepIndex: 0 }],
      ]),
    );
  });

  test("a later quest is not offered early", () => {
    expect.hasAssertions();

    expect(startQuests(seriesQuests, new Map(), secondTalkEvent, [chapter])).toStrictEqual(new Map());
  });

  test("an accepted request starts its quest", () => {
    expect.hasAssertions();

    const request = { ...createQuest("7"), kind: QuestKind.World };

    expect(startQuests([request], new Map(), undefined, [], request.id)).toStrictEqual(
      new Map([[request.id, { objectiveCounts: [], stepIndex: 0 }]]),
    );
  });

  test("a quest whose parent quest is finished starts", () => {
    expect.hasAssertions();

    const parentQuest = { ...createQuest("8"), kind: QuestKind.World };
    const childQuest = { ...createQuest("9"), kind: QuestKind.World, parentQuestIds: ["8"] };

    expect(
      startQuests([parentQuest, childQuest], new Map([["8", { objectiveCounts: [], stepIndex: 1 }]])),
    ).toStrictEqual(
      new Map([
        ["8", { objectiveCounts: [], stepIndex: 1 }],
        ["9", { objectiveCounts: [], stepIndex: 0 }],
      ]),
    );
  });

  test("a quest waits on every parent quest, and on one the world does not carry", () => {
    expect.hasAssertions();

    const parentQuest = { ...createQuest("8"), kind: QuestKind.World };
    const childQuest = { ...createQuest("9"), kind: QuestKind.World, parentQuestIds: ["8", "uncarried"] };

    expect(
      startQuests([parentQuest, childQuest], new Map([["8", { objectiveCounts: [], stepIndex: 1 }]])),
    ).toStrictEqual(new Map([["8", { objectiveCounts: [], stepIndex: 1 }]]));
  });
});
