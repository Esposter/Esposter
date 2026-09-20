import type { SpeechVoice } from "#src/models/SpeechVoice";

import { SpeechVoiceField } from "#src/models/SpeechVoiceField";
import { VOICE_FIELD_ASSIGNMENT } from "#src/services/constants";

const WHITESPACE_RUN_REGEX = /\s+/gu;

// The voice name first, then any of the markup's adjustments as `key=value` in any order. A key this does not know
// Is dropped rather than refused: the line is hand-written, and an unreadable field costs one adjustment, not the
// Voice
export const parseSpeechVoice = (text: string): SpeechVoice => {
  const [name = "", ...fields] = text.trim().split(WHITESPACE_RUN_REGEX);
  const voice: SpeechVoice = { name, pitch: "", rate: "", style: "", styleDegree: "" };
  for (const field of fields) {
    const separatorIndex = field.indexOf(VOICE_FIELD_ASSIGNMENT);
    if (separatorIndex < 1) continue;

    const key = field.slice(0, separatorIndex);
    const value = field.slice(separatorIndex + VOICE_FIELD_ASSIGNMENT.length);
    if (!value) continue;
    else if (key === SpeechVoiceField.Pitch) voice.pitch = value;
    else if (key === SpeechVoiceField.Rate) voice.rate = value;
    else if (key === SpeechVoiceField.Style) voice.style = value;
    else if (key === SpeechVoiceField.StyleDegree) voice.styleDegree = value;
  }

  return voice;
};
