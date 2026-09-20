import type { SessionStartOutput } from "#src/models/SessionStartOutput";

import { CARD_LINE_PREFIX, GREETING_PREFIX } from "#src/services/constants";

// The whole card is context for the model; the person sees the headline, the character's own greeting when the
// Card has one, and the birthday line, so the welcome is in voice and costs no tokens twice
export const getSessionStartOutput = (card: string): string => {
  const [headline = "", ...lines] = card.split("\n");
  const birthdayLine = lines.find((line) => !line.startsWith(CARD_LINE_PREFIX)) ?? "";
  const greeting = lines.find((line) => line.startsWith(GREETING_PREFIX))?.slice(GREETING_PREFIX.length) ?? "";
  const output: SessionStartOutput = {
    hookSpecificOutput: { additionalContext: card, hookEventName: "SessionStart" },
    systemMessage: [headline.replace("Persona: ", "✦ "), greeting, birthdayLine].filter(Boolean).join("\n"),
  };
  return JSON.stringify(output);
};
