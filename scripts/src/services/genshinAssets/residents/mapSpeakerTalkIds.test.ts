import { mapSpeakerTalkIds } from "#src/services/genshinAssets/residents/mapSpeakerTalkIds";
import { describe, expect, test } from "vitest";

describe(mapSpeakerTalkIds, () => {
  test("gives each speaker the lowest-numbered talk they speak in", () => {
    expect.hasAssertions();

    expect(
      mapSpeakerTalkIds([
        { speakerId: 1002, talkId: 30 },
        { speakerId: 1002, talkId: 10 },
        { speakerId: 1002, talkId: 30 },
        { speakerId: 1005, talkId: 20 },
      ]),
    ).toStrictEqual(
      new Map([
        [1002, 10],
        [1005, 20],
      ]),
    );
  });
});
