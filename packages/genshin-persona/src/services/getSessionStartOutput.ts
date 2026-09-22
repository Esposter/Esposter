import type { Card } from "#src/models/Card";
import type { SessionStartOutput } from "#src/models/SessionStartOutput";

import { DEFAULT_LANGUAGE, NAMEPLATE_PREFIX, REPLY_LANGUAGE_INSTRUCTION } from "#src/services/constants";
import { formatCard } from "#src/services/formatCard";

// The whole card is context for the model; the person sees the nameplate, the note and the greeting in their own
// Language when the card has one, so the welcome is in voice and costs no tokens twice. The reply language rides in the
// Context rather than in the output style, which is a file the plugin ships and cannot vary per person, and it is
// Absent only when everything the model reads is English already — the reply language and the card's, which is the
// Interface language's — so the common case costs nothing and a card in another language never pulls the spoken lines
// Into it
export const getSessionStartOutput = (card: Card, replyLanguage: string, interfaceLanguage: string): string => {
  const isEnglishThroughout = replyLanguage === DEFAULT_LANGUAGE && interfaceLanguage === DEFAULT_LANGUAGE;
  const instruction = isEnglishThroughout ? "" : REPLY_LANGUAGE_INSTRUCTION(replyLanguage);
  const output: SessionStartOutput = {
    hookSpecificOutput: {
      additionalContext: [formatCard(card), instruction].filter(Boolean).join("\n"),
      hookEventName: "SessionStart",
    },
    systemMessage: [`${NAMEPLATE_PREFIX}${card.headline}`, card.note, card.greeting].filter(Boolean).join("\n"),
  };
  return JSON.stringify(output);
};
