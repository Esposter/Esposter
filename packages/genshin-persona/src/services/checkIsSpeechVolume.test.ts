import { checkIsSpeechVolume } from "#src/services/checkIsSpeechVolume";
import { describe, expect, test } from "vitest";

describe(checkIsSpeechVolume, () => {
  test.each(["silent", "x-loud", "default", "0", "100"])("accepts %j", (value) => {
    expect.hasAssertions();

    expect(checkIsSpeechVolume(value)).toBe(true);
  });

  test.each(["", "louder", "101", "-1", "50%", "+3dB"])("rejects %j", (value) => {
    expect.hasAssertions();

    expect(checkIsSpeechVolume(value)).toBe(false);
  });
});
