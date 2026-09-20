import type { Card } from "#src/models/Card";

import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { describe, expect, test } from "vitest";

describe(getSessionStartOutput, () => {
  const description = "description";
  const headline = "headline";
  const note = "[note]";
  const greeting = "greeting";
  const context = `- habit\n- Greets: ${greeting}\n- Signs off: sign-off`;

  test("shows the person the nameplate, the note and the greeting, and hands the model the lore and the context", () => {
    expect.hasAssertions();

    const card: Card = {
      description,
      headline,
      note,
      voiceCard: { context, greeting, tips: ["tip"], verbs: ["verb"] },
    };

    expect(getSessionStartOutput(card)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `Persona: ${headline}\n${description}\n${note}\n${context}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `✦ ${headline}\n${note}\n${greeting}`,
      }),
    );
  });

  test("drops every line the character does not have", () => {
    expect.hasAssertions();

    const card: Card = {
      description: "",
      headline,
      note: "",
      voiceCard: { context: "", greeting: "", tips: [], verbs: [] },
    };

    expect(getSessionStartOutput(card)).toBe(
      JSON.stringify({
        hookSpecificOutput: { additionalContext: `Persona: ${headline}`, hookEventName: "SessionStart" },
        systemMessage: `✦ ${headline}`,
      }),
    );
  });
});
