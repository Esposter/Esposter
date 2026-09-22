import type { Card } from "#src/models/Card";
import type { SessionStartOutput } from "#src/models/SessionStartOutput";

import { DEFAULT_LANGUAGE, NAMEPLATE_PREFIX, REPLY_LANGUAGE_INSTRUCTION } from "#src/services/constants";
import { formatCard } from "#src/services/formatCard";

// The whole card is context for the model; the person sees the nameplate, the note, the plugin's remarks and the
// Greeting in their own language when the card has one, so the welcome is in voice and costs no tokens twice. The
// Remarks are the person's alone — how the character was chosen, who is close, whether the voice is on — since none
// Is a fact the model answers from. The reply language rides in the context rather than in the output style, which
// Is a file the plugin ships and cannot vary per person, and it is absent only when everything the model reads is
// English already — the reply language and the card's, which is the interface language's — so the common case
// Costs nothing and a card in another language never pulls the spoken lines into it
export const getSessionStartOutput = (
  card: Card,
  remarks: string[],
  replyLanguage: string,
  interfaceLanguage: string,
): string => {
  const isEnglishThroughout = replyLanguage === DEFAULT_LANGUAGE && interfaceLanguage === DEFAULT_LANGUAGE;
  const instruction = isEnglishThroughout ? "" : REPLY_LANGUAGE_INSTRUCTION(replyLanguage);
  const output: SessionStartOutput = {
    hookSpecificOutput: {
      additionalContext: [formatCard(card), instruction].filter(Boolean).join("\n"),
      hookEventName: "SessionStart",
    },
    systemMessage: [`${NAMEPLATE_PREFIX}${card.headline}`, card.note, ...remarks, card.greeting]
      .filter(Boolean)
      .join("\n"),
  };
  return JSON.stringify(output);
};
