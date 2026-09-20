import { getVoiceText } from "#src/services/voiceMatch/rank/getVoiceText";
import { describe, expect, test } from "vitest";

describe(getVoiceText, () => {
  test("writes only the adjustments that were measured", () => {
    expect.hasAssertions();

    expect(getVoiceText({ pitch: -4, rate: 0, score: 0.8, voice: "en-AU-CarlyNeural" })).toBe(
      `{ name: "en-AU-CarlyNeural", pitch: -4 }`,
    );
  });

  // The name is the catalogue's, so a quote or a backslash in it would otherwise close or escape the literal the
  // Card is written with
  test("quotes a name that carries the literal's own punctuation", () => {
    expect.hasAssertions();

    const voice = String.raw`en-AU-"Carly\Neural`;

    expect(getVoiceText({ pitch: 0, rate: 0, score: 0.8, voice })).toBe(String.raw`{ name: "en-AU-\"Carly\\Neural" }`);
  });
});
