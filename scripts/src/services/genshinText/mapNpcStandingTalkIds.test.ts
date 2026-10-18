import { mapNpcStandingTalkIds } from "#src/services/genshinText/mapNpcStandingTalkIds";
import { describe, expect, test } from "vitest";

describe(mapNpcStandingTalkIds, () => {
  const STANDING_TALK = {
    beginCond: [{}],
    beginWay: "TALK_BEGIN_MANUAL",
    id: 2,
    initDialog: 201,
    npcId: [0],
    questId: 0,
  };

  test("gives each character its lowest-numbered standing talk", () => {
    expect.hasAssertions();

    expect(mapNpcStandingTalkIds([STANDING_TALK, { ...STANDING_TALK, id: 1, initDialog: 101 }])).toStrictEqual(
      new Map([[0, 1]]),
    );
  });

  test.each([
    ["a quest's talk", { questId: 1 }],
    ["a talk begun by itself", { beginWay: "TALK_BEGIN_AUTO" }],
    ["an activity's talk", { loadType: "TALK_ACTIVITY" }],
    ["a talk waiting on a quest", { beginCond: [{ type: "QUEST_COND_STATE_EQUAL" }] }],
    ["a talk with no first dialog", { initDialog: 0 }],
  ])("leaves out %s", (_title, override) => {
    expect.hasAssertions();

    expect(mapNpcStandingTalkIds([{ ...STANDING_TALK, ...override }])).toStrictEqual(new Map());
  });
});
