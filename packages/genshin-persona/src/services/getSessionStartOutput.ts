import type { Card } from "#src/models/Card";
import type { SessionStartOutput } from "#src/models/SessionStartOutput";

import { GREETING_PREFIX, NAMEPLATE_PREFIX } from "#src/services/constants";
import { formatCard } from "#src/services/formatCard";

// The whole card is context for the model; the person sees the nameplate, the note and the character's own greeting
// When the card has one, so the welcome is in voice and costs no tokens twice
export const getSessionStartOutput = (card: Card): string => {
  const greeting =
    card.voiceCard
      .split("\n")
      .find((line) => line.startsWith(GREETING_PREFIX))
      ?.slice(GREETING_PREFIX.length) ?? "";
  const output: SessionStartOutput = {
    hookSpecificOutput: { additionalContext: formatCard(card), hookEventName: "SessionStart" },
    systemMessage: [`${NAMEPLATE_PREFIX}${card.headline}`, card.note, greeting].filter(Boolean).join("\n"),
  };
  return JSON.stringify(output);
};
