import type { Card } from "#src/models/Card";
import type { LoreRate } from "#src/models/LoreRate";
import type { SessionStartOutput } from "#src/models/SessionStartOutput";

import {
  CHARACTER_LINE_PREFIX,
  DEFAULT_LANGUAGE,
  ELEMENT_LINE_PREFIX,
  LORE_RATES_LINE_PREFIX,
  NAMEPLATE_PREFIX,
  RARITY_LINE_PREFIX,
} from "#src/services/constants";
import { formatCard } from "#src/services/formatCard";
import { getReplyLanguageInstruction } from "#src/services/getReplyLanguageInstruction";

// The whole card is context for the model; the person sees the nameplate, the note, the plugin's remarks and the
// Greeting in their own language when the card has one, so the welcome is in voice and costs no tokens twice. The
// Remarks are the person's alone — how the character was chosen, who is close, whether the voice is on — since none
// Is a fact the model answers from. The reply language rides in the context rather than in the output style, which
// Is a file the plugin ships and cannot vary per person, and it is absent only when everything the model reads is
// English already — the reply language and the card's, which is the interface language's — so the common case
// Costs nothing and a card in another language never pulls the spoken lines into it. The context's last lines name
// The character for a program — the agent console's Genshin theme — rather than for the model: its stars, and the
// Welcome chart's rows when the lore pick chose it, which the theme's rates panel shows
export const getSessionStartOutput = (
  card: Card,
  remarks: string[],
  replyLanguage: string,
  interfaceLanguage: string,
  loreRates: LoreRate[] = [],
): string => {
  const isEnglishThroughout = replyLanguage === DEFAULT_LANGUAGE && interfaceLanguage === DEFAULT_LANGUAGE;
  const instruction = isEnglishThroughout ? "" : getReplyLanguageInstruction(replyLanguage);
  const output: SessionStartOutput = {
    hookSpecificOutput: {
      additionalContext: [
        formatCard(card),
        instruction,
        `${CHARACTER_LINE_PREFIX}${card.name}`,
        card.element ? `${ELEMENT_LINE_PREFIX}${card.element}` : "",
        `${RARITY_LINE_PREFIX}${card.rarity}`,
        loreRates.length > 0 ? `${LORE_RATES_LINE_PREFIX}${JSON.stringify(loreRates)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      hookEventName: "SessionStart",
    },
    systemMessage: [`${NAMEPLATE_PREFIX}${card.headline}`, card.note, ...remarks, card.greeting]
      .filter(Boolean)
      .join("\n"),
  };
  return JSON.stringify(output);
};
