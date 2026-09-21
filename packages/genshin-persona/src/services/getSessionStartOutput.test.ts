import type { Card } from "#src/models/Card";
import type { PersonaCard } from "#src/models/PersonaCard";

import {
  CONTEXT_HEADLINE_PREFIX,
  DEFAULT_LANGUAGE,
  NAMEPLATE_PREFIX,
  REPLY_LANGUAGE_INSTRUCTION,
} from "#src/services/constants";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { parseJsonObject } from "#src/services/parseJsonObject";
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

    const card: Card = { description, greeting, headline, note, personaCard };

    expect(getSessionStartOutput(card, DEFAULT_LANGUAGE)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `${CONTEXT_HEADLINE_PREFIX}${headline}\n${description}\n${note}\n- ${habit}\n- Greets: ${greeting}\n- Signs off: ${signOff}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `${NAMEPLATE_PREFIX}${headline}\n${note}\n${greeting}`,
      }),
    );
  });

  test("drops every line the character does not have", () => {
    expect.hasAssertions();

    const card: Card = { description: "", greeting: "", headline, note: "", personaCard: undefined };

    expect(getSessionStartOutput(card, DEFAULT_LANGUAGE)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `${CONTEXT_HEADLINE_PREFIX}${headline}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `${NAMEPLATE_PREFIX}${headline}`,
      }),
    );
  });

  // The reply language rides in the context beside the card rather than in the output style, which the plugin
  // Ships and cannot vary per person; English is the default the model already writes in, so it costs no line
  test("carries no instruction at English, and one naming the language otherwise", () => {
    expect.hasAssertions();

    const card: Card = { description: "", greeting: "", headline, note: "", personaCard: undefined };
    const { hookSpecificOutput } = parseJsonObject(getSessionStartOutput(card, "Japanese"));

    expect(hookSpecificOutput).toStrictEqual({
      additionalContext: `${CONTEXT_HEADLINE_PREFIX}${headline}\n${REPLY_LANGUAGE_INSTRUCTION("Japanese")}`,
      hookEventName: "SessionStart",
    });
    expect(getSessionStartOutput(card, DEFAULT_LANGUAGE)).not.toContain(REPLY_LANGUAGE_INSTRUCTION(DEFAULT_LANGUAGE));
  });
});
