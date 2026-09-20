import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { parseVoiceRequest } from "#src/services/parseVoiceRequest";
import { describe, expect, test } from "vitest";

describe(parseVoiceRequest, () => {
  const request = {
    language: VoiceLanguage.English,
    name: "name",
    stem: "stem",
    text: "text",
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
    { ...request, text: undefined },
  ])("rejects %j", (value) => {
    expect.hasAssertions();

    expect(parseVoiceRequest(JSON.stringify(value))).toBeUndefined();
  });
});
