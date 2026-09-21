import type { Card } from "#src/models/Card";
import type { SessionStartOutput } from "#src/models/SessionStartOutput";

import { DEFAULT_LANGUAGE, NAMEPLATE_PREFIX, REPLY_LANGUAGE_INSTRUCTION } from "#src/services/constants";
import { formatCard } from "#src/services/formatCard";

// The whole card is context for the model; the person sees the nameplate, the note and the character's own greeting
// When the card has one, so the welcome is in voice and costs no tokens twice. The reply language rides in the
// Context rather than in the output style, which is a file the plugin ships and cannot vary per person, and it is
// Absent at English so the common case costs nothing
export const getSessionStartOutput = (card: Card, replyLanguage: string): string => {
  const instruction = replyLanguage === DEFAULT_LANGUAGE ? "" : REPLY_LANGUAGE_INSTRUCTION(replyLanguage);
  const output: SessionStartOutput = {
    hookSpecificOutput: {
      additionalContext: [formatCard(card), instruction].filter(Boolean).join("\n"),
      hookEventName: "SessionStart",
    },
    systemMessage: [`${NAMEPLATE_PREFIX}${card.headline}`, card.note, card.personaCard?.greeting ?? ""]
      .filter(Boolean)
      .join("\n"),
  };
  return JSON.stringify(output);
};
