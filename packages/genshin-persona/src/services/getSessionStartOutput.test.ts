import type { Card } from "#src/models/Card";
import type { PersonaCard } from "#src/models/PersonaCard";

import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { describe, expect, test } from "vitest";

describe(getSessionStartOutput, () => {
  const description = "description";
  const headline = "headline";
  const note = "[note]";
  const greeting = "greeting";
  const signOff = "sign-off";
  const habit = "habit";
  // The session-start output never reads the voice, the tips or the verbs; production owns what those are
  const personaCard: PersonaCard = {
    greeting,
    habits: [habit],
    signOff,
    tips: ["tip"],
    verbs: ["verb"],
    voice: { name: "" },
  };

  test("shows the person the nameplate, the note and the greeting, and hands the model the lore and the habits", () => {
    expect.hasAssertions();

    const card: Card = { description, headline, note, personaCard };

    expect(getSessionStartOutput(card)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `Persona: ${headline}\n${description}\n${note}\n- ${habit}\n- Greets: ${greeting}\n- Signs off: ${signOff}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `✦ ${headline}\n${note}\n${greeting}`,
      }),
    );
  });

  test("drops every line the character does not have", () => {
    expect.hasAssertions();

    const card: Card = { description: "", headline, note: "", personaCard: undefined };

    expect(getSessionStartOutput(card)).toBe(
      JSON.stringify({
        hookSpecificOutput: { additionalContext: `Persona: ${headline}`, hookEventName: "SessionStart" },
        systemMessage: `✦ ${headline}`,
      }),
    );
  });
});
