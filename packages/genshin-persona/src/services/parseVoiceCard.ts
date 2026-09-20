import type { VoiceCard } from "#src/models/VoiceCard";

import { GREETING_PREFIX, TIP_PREFIX, VERB_SEPARATOR, VERBS_PREFIX } from "#src/services/constants";

// The spinner lines are lifted out so the context the model reads stays at the card's ceiling
export const parseVoiceCard = (text: string): VoiceCard => {
  const context: string[] = [];
  const tips: string[] = [];
  const verbs: string[] = [];
  let greeting = "";

  for (const line of text.split("\n"))
    if (line.startsWith(TIP_PREFIX)) tips.push(line.slice(TIP_PREFIX.length));
    else if (line.startsWith(VERBS_PREFIX)) verbs.push(...line.slice(VERBS_PREFIX.length).split(VERB_SEPARATOR));
    else if (line) {
      if (line.startsWith(GREETING_PREFIX)) greeting = line.slice(GREETING_PREFIX.length);
      context.push(line);
    }

  return { context: context.join("\n"), greeting, tips, verbs };
};
