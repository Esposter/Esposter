import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { parseVoiceRequest } from "#src/services/parseVoiceRequest";
import { describe, expect, test } from "vitest";

describe(parseVoiceRequest, () => {
  const request = {
    index: 0,
    isFinal: false,
    language: VoiceLanguage.English,
    lines: ["lines"],
    messageId: "messageId",
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
    { ...request, type: "" },
    { ...request, language: "" },
    { ...request, volume: "0" },
    { ...request, volume: 101 },
    { ...request, lines: "lines" },
    { ...request, lines: [0] },
    { ...request, turnId: undefined },
    { ...request, messageId: undefined },
    { ...request, index: -1 },
    { ...request, index: 0.1 },
    { ...request, isFinal: "false" },
  ])("rejects %j", (value) => {
    expect.hasAssertions();

    expect(parseVoiceRequest(JSON.stringify(value))).toBeUndefined();
  });
});
