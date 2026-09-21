import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { parseVoiceRequest } from "#src/services/parseVoiceRequest";
import { describe, expect, test } from "vitest";

describe(parseVoiceRequest, () => {
  const request = {
    language: VoiceLanguage.English,
    lines: ["lines"],
    name: "name",
    stem: "stem",
    turnId: "turnId",
    type: VoiceRequestType.Speak,
    volume: 0,
  };

  test("reads a request", () => {
    expect.hasAssertions();

    expect(parseVoiceRequest(JSON.stringify(request))).toStrictEqual(request);
  });

  test("reads a stop by its type alone", () => {
    expect.hasAssertions();

    expect(parseVoiceRequest(JSON.stringify({ type: VoiceRequestType.Stop }))).toStrictEqual({
      type: VoiceRequestType.Stop,
    });
  });

  test.each([
    { ...request, type: "sing" },
    { ...request, language: "fr" },
    { ...request, volume: "100" },
    { ...request, volume: 101 },
    { ...request, lines: "lines" },
    { ...request, lines: [0] },
    { ...request, turnId: undefined },
  ])("rejects %j", (value) => {
    expect.hasAssertions();

    expect(parseVoiceRequest(JSON.stringify(value))).toBeUndefined();
  });
});
