import type { Card } from "#src/models/Card";
import type { PersonaCard } from "#src/models/PersonaCard";
import type { SessionStartOutput } from "#src/models/SessionStartOutput";

import { DEFAULT_LANGUAGE, REPLY_LANGUAGE_INSTRUCTION } from "#src/services/constants";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { describe, expect, test } from "vitest";

describe(getSessionStartOutput, () => {
  const description = "description";
  const headline = "headline";
  const note = "[note]";
  const greeting = "greeting";
  const signOff = "sign-off";
  const habit = "habit";
  // The session-start output never reads the voice or the verbs; production owns what those are
  const personaCard: PersonaCard = {
    greeting,
    habits: [habit],
    signOff,
    verbs: ["verb"],
  };

  test("shows the person the nameplate, the note and the greeting, and hands the model the lore and the habits", () => {
    expect.hasAssertions();

    const card: Card = { description, headline, note, personaCard };

    expect(getSessionStartOutput(card, DEFAULT_LANGUAGE)).toBe(
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

    expect(getSessionStartOutput(card, DEFAULT_LANGUAGE)).toBe(
      JSON.stringify({
        hookSpecificOutput: { additionalContext: `Persona: ${headline}`, hookEventName: "SessionStart" },
        systemMessage: `✦ ${headline}`,
      }),
    );
  });

  // The reply language rides in the context beside the card rather than in the output style, which the plugin
  // Ships and cannot vary per person; English is the default the model already writes in, so it costs no line
  test("carries no instruction at English, and one naming the language otherwise", () => {
    expect.hasAssertions();

    const card: Card = { description: "", headline, note: "", personaCard: undefined };
    const { hookSpecificOutput } = JSON.parse(getSessionStartOutput(card, "Japanese")) as SessionStartOutput;

    expect(hookSpecificOutput.additionalContext).toBe(
      `Persona: ${headline}\n${REPLY_LANGUAGE_INSTRUCTION("Japanese")}`,
    );
    expect(getSessionStartOutput(card, DEFAULT_LANGUAGE)).not.toContain(REPLY_LANGUAGE_INSTRUCTION(DEFAULT_LANGUAGE));
  });
});
