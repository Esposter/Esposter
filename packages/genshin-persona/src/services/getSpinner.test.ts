import type { VoiceCard } from "#src/models/VoiceCard";

import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSpinner, () => {
  const name = "Hu Tao";
  const base: VoiceCard = { context: "", greeting: "", tips: ["baseTip"], verbs: ["baseVerb"] };
  const voiceCard: VoiceCard = { context: "", greeting: "", tips: ["tip"], verbs: ["verb"] };

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
