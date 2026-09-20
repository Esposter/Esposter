import type { Card } from "#src/models/Card";

import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { describe, expect, test } from "vitest";

describe(getSessionStartOutput, () => {
  const headline = "headline";
  const note = "[note]";
  const greeting = "greeting";
  const voiceCard = `- habit\n- Greets: ${greeting}\n- Signs off: sign-off`;

  test("shows the person the nameplate, the note and the greeting, and hands the model the whole card", () => {
    expect.hasAssertions();

    const card: Card = { headline, note, voiceCard };

    expect(getSessionStartOutput(card)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `Persona: ${headline}\n${note}\n${voiceCard}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `✦ ${headline}\n${note}\n${greeting}`,
      }),
    );
  });

  test("drops the note and the greeting when the character has neither", () => {
    expect.hasAssertions();

    const card: Card = { headline, note: "", voiceCard: "" };

    expect(getSessionStartOutput(card)).toBe(
      JSON.stringify({
        hookSpecificOutput: { additionalContext: `Persona: ${headline}`, hookEventName: "SessionStart" },
        systemMessage: `✦ ${headline}`,
      }),
    );
  });
});
