import type { FetterEntry } from "#src/models/genshinText/FetterEntry";
import type { VoiceLine } from "genshin-persona/src/models/VoiceLine.ts";

import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";

// One character's voice-over lines in one language's text map, a line the language has no text for left out
export const getVoiceLines = (fetters: FetterEntry[], textMap: Map<string, string>): VoiceLine[] =>
  fetters.flatMap(({ voiceFileTextTextMapHash, voiceTitleTextMapHash }) => {
    const text = textMap.get(String(voiceFileTextTextMapHash));
    if (!text) return [];
    return [
      { text: getPlainGameText(text), title: getPlainGameText(textMap.get(String(voiceTitleTextMapHash)) ?? "") },
    ];
  });
