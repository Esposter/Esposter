import { parseSpeechVoice } from "#src/services/parseSpeechVoice";
import { describe, expect, test } from "vitest";

describe(parseSpeechVoice, () => {
  const name = "a";

  test("reads the voice name alone and leaves every adjustment unsaid", () => {
    expect.hasAssertions();

    expect(parseSpeechVoice(name)).toStrictEqual({ name, pitch: "", rate: "", style: "", styleDegree: "" });
  });

  test("reads the adjustments after the name in any order", () => {
    expect.hasAssertions();

    expect(parseSpeechVoice(`${name} rate=rate styledegree=styleDegree style=style pitch=pitch`)).toStrictEqual({
      name,
      pitch: "pitch",
      rate: "rate",
      style: "style",
      styleDegree: "styleDegree",
    });
  });

  test("drops a field it cannot read rather than the voice", () => {
    expect.hasAssertions();

    expect(parseSpeechVoice(`${name} b=b style= =b style=style`)).toStrictEqual({
      name,
      pitch: "",
      rate: "",
      style: "style",
      styleDegree: "",
    });
  });
});
