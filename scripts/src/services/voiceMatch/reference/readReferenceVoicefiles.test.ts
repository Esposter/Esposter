import { readReferenceVoicefiles } from "#src/services/voiceMatch/reference/readReferenceVoicefiles";
import { readGenshinDb } from "@esposter/genshin-persona/src/services/readGenshinDb.ts";
import { describe, expect, test } from "vitest";

const getLineCount = (name: string) => {
  const voiceover = readGenshinDb().voiceovers(name);
  return voiceover ? voiceover.friendLines.length + voiceover.actionLines.length : 0;
};

describe(readReferenceVoicefiles, () => {
  test("keeps every line of a character who speaks alone, a colon inside a sentence included", () => {
    expect.hasAssertions();

    const name = "Arataki Itto";

    expect(readReferenceVoicefiles(name)).toHaveLength(getLineCount(name));
  });

  test("drops the scenes filed under the Traveler, which are their companion's voice", () => {
    expect.hasAssertions();

    const name = "Aether";

    expect(readReferenceVoicefiles(name).length).toBeLessThan(getLineCount(name));
  });
});
