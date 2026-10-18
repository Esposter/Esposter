import type { Card } from "#src/models/Card";
import type { LoreRate } from "#src/models/LoreRate";
import type { PersonaCard } from "#src/models/PersonaCard";

import {
  CHARACTER_LINE_PREFIX,
  CONTEXT_HEADLINE_PREFIX,
  DEFAULT_LANGUAGE,
  ELEMENT_LINE_PREFIX,
  LORE_RATES_LINE_PREFIX,
  NAMEPLATE_PREFIX,
  RARITY_LINE_PREFIX,
} from "#src/services/constants";
import { getReplyLanguageInstruction } from "#src/services/getReplyLanguageInstruction";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { parseJsonObject } from "#src/services/parseJsonObject";
import { describe, expect, test } from "vitest";

describe(getSessionStartOutput, () => {
  const description = "description";
  const element = "Anemo";
  const headline = "headline";
  const name = "name";
  const characterLine = `${CHARACTER_LINE_PREFIX}${name}`;
  const elementLine = `${ELEMENT_LINE_PREFIX}${element}`;
  const rarity = 4;
  const rarityLine = `${RARITY_LINE_PREFIX}${rarity}`;
  const note = "note";
  const greeting = "greeting";
  const signOff = "signOff";
  const habit = "habit";
  // The session-start output never reads the voice or the verbs; production owns what those are
  const personaCard: PersonaCard = { greeting, habits: [habit], signOff, verbs: ["verb"] };

  test("shows the person the nameplate, the note and the greeting, and hands the model the lore and the habits", () => {
    expect.hasAssertions();

    const card: Card = { description, element, greeting, headline, name, note, personaCard, rarity };

    expect(getSessionStartOutput(card, [], DEFAULT_LANGUAGE, DEFAULT_LANGUAGE)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `${CONTEXT_HEADLINE_PREFIX}${headline}\n${description}\n${note}\n- ${habit}\n- Greets: ${greeting}\n- Signs off: ${signOff}\n${characterLine}\n${elementLine}\n${rarityLine}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `${NAMEPLATE_PREFIX}${headline}\n${note}\n${greeting}`,
      }),
    );
  });

  // The remarks are what the plugin says about the session rather than the character, so they sit under the note and
  // Above the greeting, and reach the person alone
  test("shows the person the remarks between the note and the greeting, and the model none of them", () => {
    expect.hasAssertions();

    const card: Card = { description: "", element, greeting, headline, name, note, personaCard: undefined, rarity };
    const remark = "remark";

    expect(getSessionStartOutput(card, [remark, "", remark], DEFAULT_LANGUAGE, DEFAULT_LANGUAGE)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `${CONTEXT_HEADLINE_PREFIX}${headline}
${note}
${characterLine}
${elementLine}
${rarityLine}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `${NAMEPLATE_PREFIX}${headline}
${note}
${remark}
${remark}
${greeting}`,
      }),
    );
  });

  test("drops every line the character does not have", () => {
    expect.hasAssertions();

    const card: Card = {
      description: "",
      element: "",
      greeting: "",
      headline,
      name,
      note: "",
      personaCard: undefined,
      rarity,
    };

    expect(getSessionStartOutput(card, [], DEFAULT_LANGUAGE, DEFAULT_LANGUAGE)).toBe(
      JSON.stringify({
        hookSpecificOutput: {
          additionalContext: `${CONTEXT_HEADLINE_PREFIX}${headline}\n${characterLine}\n${rarityLine}`,
          hookEventName: "SessionStart",
        },
        systemMessage: `${NAMEPLATE_PREFIX}${headline}`,
      }),
    );
  });

  // The reply language rides in the context beside the card rather than in the output style, which the plugin
  // Ships and cannot vary per person; English is the default the model already writes in, so it costs no line
  // While the card it reads is English too. The card is in the interface language, and an English reply beside a
  // Card in another language would otherwise drift into it
  test.each([
    ["Japanese", DEFAULT_LANGUAGE],
    ["Japanese", "Japanese"],
    [DEFAULT_LANGUAGE, "Japanese"],
  ])("carries an instruction naming the reply language %s beside a card in %s", (replyLanguage, interfaceLanguage) => {
    expect.hasAssertions();

    const card: Card = {
      description: "",
      element,
      greeting: "",
      headline,
      name,
      note: "",
      personaCard: undefined,
      rarity,
    };
    const { hookSpecificOutput } = parseJsonObject(getSessionStartOutput(card, [], replyLanguage, interfaceLanguage));

    expect(hookSpecificOutput).toStrictEqual({
      additionalContext: `${CONTEXT_HEADLINE_PREFIX}${headline}\n${getReplyLanguageInstruction(replyLanguage)}\n${characterLine}\n${elementLine}\n${rarityLine}`,
      hookEventName: "SessionStart",
    });
  });

  // The welcome chart's rows reach the theme as one line of JSON, and only when the lore pick drew them
  test("carries the welcome chart's rows as JSON, and none when the lore pick drew no rows", () => {
    expect.hasAssertions();

    const card: Card = {
      description: "",
      element: "",
      greeting: "",
      headline,
      name,
      note: "",
      personaCard: undefined,
      rarity,
    };
    const loreRates: LoreRate[] = [{ displayName: "displayName", name, probability: 0.5 }];
    const { hookSpecificOutput: withRates } = parseJsonObject(
      getSessionStartOutput(card, [], DEFAULT_LANGUAGE, DEFAULT_LANGUAGE, loreRates),
    );
    const { hookSpecificOutput: withoutRates } = parseJsonObject(
      getSessionStartOutput(card, [], DEFAULT_LANGUAGE, DEFAULT_LANGUAGE),
    );

    expect(withRates.additionalContext).toBe(
      `${CONTEXT_HEADLINE_PREFIX}${headline}\n${characterLine}\n${rarityLine}\n${LORE_RATES_LINE_PREFIX}${JSON.stringify(loreRates)}`,
    );
    expect(withoutRates.additionalContext).toBe(
      `${CONTEXT_HEADLINE_PREFIX}${headline}\n${characterLine}\n${rarityLine}`,
    );
  });
});
