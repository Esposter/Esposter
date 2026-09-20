import type { VoiceCard } from "#src/models/VoiceCard";

import { GREETING_PREFIX, TIP_PREFIX, VERB_SEPARATOR, VERBS_PREFIX, VOICE_PREFIX } from "#src/services/constants";
import { parseSpeechVoice } from "#src/services/parseSpeechVoice";

// The spinner lines and the voice are lifted out so the context the model reads stays at the card's ceiling — and
// So a character is never told the name of the voice reading them
export const parseVoiceCard = (text: string): VoiceCard => {
  const context: string[] = [];
  const tips: string[] = [];
  const verbs: string[] = [];
  let greeting = "";
  let voice = parseSpeechVoice("");

  for (const line of text.split("\n"))
    if (line.startsWith(TIP_PREFIX)) tips.push(line.slice(TIP_PREFIX.length));
    else if (line.startsWith(VERBS_PREFIX)) verbs.push(...line.slice(VERBS_PREFIX.length).split(VERB_SEPARATOR));
    else if (line.startsWith(VOICE_PREFIX)) voice = parseSpeechVoice(line.slice(VOICE_PREFIX.length));
    else if (line) {
      if (line.startsWith(GREETING_PREFIX)) greeting = line.slice(GREETING_PREFIX.length);
      context.push(line);
    }

  return { context: context.join("\n"), greeting, tips, verbs, voice };
};
