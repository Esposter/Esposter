import type { VoiceCard } from "#src/models/VoiceCard";

import { getSpinner } from "#src/services/getSpinner";
import { parseSpeechVoice } from "#src/services/parseSpeechVoice";
import { describe, expect, test } from "vitest";

describe(getSpinner, () => {
  const name = "Hu Tao";
  // The spinner never reads the voice; production owns what an unset one is
  const voice = parseSpeechVoice("");
  const base: VoiceCard = { context: "", greeting: "", tips: ["baseTip"], verbs: ["baseVerb"], voice };
  const voiceCard: VoiceCard = { context: "", greeting: "", tips: ["tip"], verbs: ["verb"], voice };

  test("labels the spinner with the nameplate and puts the base content ahead of the character's", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, voiceCard)).toStrictEqual({
      label: `✦ ${name}`,
      tips: [
        { id: "teyvat-1", text: "baseTip" },
        { id: "hu-tao-1", text: "tip" },
      ],
      verbs: ["baseVerb", "verb"],
    });
  });
});
