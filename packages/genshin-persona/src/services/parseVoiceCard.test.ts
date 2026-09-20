import { parseVoiceCard } from "#src/services/parseVoiceCard";
import { describe, expect, test } from "vitest";

describe(parseVoiceCard, () => {
  const habit = "- habit";
  const greeting = "greeting";
  const signOff = "- Signs off: sign-off";
  const silentVoice = { name: "", pitch: "", rate: "", style: "", styleDegree: "" };

  test("keeps the habits, the greeting and the sign-off as context and lifts the spinner lines out", () => {
    expect.hasAssertions();

    const text = [habit, `- Greets: ${greeting}`, signOff, "- Verbs: a, b", "- Tip: tip", "- Verbs: c"].join("\n");

    expect(parseVoiceCard(text)).toStrictEqual({
      context: [habit, `- Greets: ${greeting}`, signOff].join("\n"),
      greeting,
      tips: ["tip"],
      verbs: ["a", "b", "c"],
      voice: silentVoice,
    });
  });

  test("lifts the voice out of the context, so the character is never told what reads them", () => {
    expect.hasAssertions();

    expect(parseVoiceCard([habit, "- Voice: a style=style"].join("\n"))).toStrictEqual({
      context: habit,
      greeting: "",
      tips: [],
      verbs: [],
      voice: { ...silentVoice, name: "a", style: "style" },
    });
  });

  test("reads an empty card as nothing", () => {
    expect.hasAssertions();

    expect(parseVoiceCard("")).toStrictEqual({
      context: "",
      greeting: "",
      tips: [],
      verbs: [],
      voice: silentVoice,
    });
  });
});
