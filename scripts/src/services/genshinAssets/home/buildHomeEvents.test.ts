import {
  HOME_AVATAR_REWARD_EVENT_TYPE,
  HOME_AVATAR_SUMMON_EVENT_TYPE,
} from "#src/services/genshinAssets/home/constants";
import { buildHomeEvents } from "#src/services/genshinAssets/home/buildHomeEvents";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"));

// Made-up companion, suite, reward and talk ids
const FIRST_COMPANION_ID = 1;
const SECOND_COMPANION_ID = 2;
const FIRST_SUITE_ID = 10;
const SECOND_SUITE_ID = 20;
const FIRST_REWARD_ID = 100;
const SECOND_REWARD_ID = 200;
const FIRST_TALK_ID = 1000;
const SECOND_TALK_ID = 2000;
const rewardRow = (avatarID: number, furnitureSuitID: number, rewardID: number, talkID: number) => ({
  avatarID,
  eventType: HOME_AVATAR_REWARD_EVENT_TYPE,
  furnitureSuitID,
  rewardID,
  talkID,
});
// A summon event holds no reward, which the dump's defaults write back as zero
const summonRow = (avatarID: number, furnitureSuitID: number, talkID: number) => ({
  avatarID,
  eventType: HOME_AVATAR_SUMMON_EVENT_TYPE,
  furnitureSuitID,
  rewardID: 0,
  talkID,
});

describe(buildHomeEvents, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("each favour is published with its companion, suite, reward and talk, sorted by suite, and a summon is left out", () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockReturnValueOnce([
      rewardRow(SECOND_COMPANION_ID, SECOND_SUITE_ID, SECOND_REWARD_ID, SECOND_TALK_ID),
      summonRow(SECOND_COMPANION_ID, SECOND_SUITE_ID, SECOND_TALK_ID),
      rewardRow(FIRST_COMPANION_ID, FIRST_SUITE_ID, FIRST_REWARD_ID, FIRST_TALK_ID),
    ]);

    expect(buildHomeEvents()).toStrictEqual({
      [`${GameDataset.Home}/events`]: {
        favours: [
          {
            avatarId: FIRST_COMPANION_ID,
            furnitureSuitId: FIRST_SUITE_ID,
            rewardId: FIRST_REWARD_ID,
            talkId: FIRST_TALK_ID,
          },
          {
            avatarId: SECOND_COMPANION_ID,
            furnitureSuitId: SECOND_SUITE_ID,
            rewardId: SECOND_REWARD_ID,
            talkId: SECOND_TALK_ID,
          },
        ],
      },
    });
  });
});
