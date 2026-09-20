import { getSsml } from "#src/services/getSsml";
import { describe, expect, test } from "vitest";

describe(getSsml, () => {
  const voice = "en-AU-NatashaNeural";
  const text = "State your dispute & spare the details.";

  test("wraps the escaped text in the voice under its locale", () => {
    expect.hasAssertions();

    expect(getSsml({ text, voice, volume: "" })).toBe(
      `<speak version="1.0" xml:lang="en-AU"><voice name="${voice}">State your dispute &amp; spare the details.</voice></speak>`,
    );
  });

  test("wraps the text in the volume when one was set", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "text", voice, volume: "loud" })).toBe(
      `<speak version="1.0" xml:lang="en-AU"><voice name="${voice}"><prosody volume="loud">text</prosody></voice></speak>`,
    );
  });
});
