import type { VoiceRequest } from "#src/models/VoiceRequest";

import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { checkIsVoiceLanguage } from "#src/services/checkIsVoiceLanguage";
import { checkIsVolume } from "#src/services/checkIsVolume";
import { parseJsonObject } from "#src/services/parseJsonObject";

// One line off the socket as a request, or nothing for a line that is not one: the socket is a local path anything
// On the machine can write to, so every field is checked before the synthesizer acts on it. A line that is not
// JSON at all throws, and the server answers that as it answers any request that fails
export const parseVoiceRequest = (line: string): undefined | VoiceRequest => {
  const { index, isFinal, language, lines, messageId, name, stem, turnId, type, volume } = parseJsonObject(line);
  if (type === VoiceRequestType.Stop) return { type };
  if (
    (type !== VoiceRequestType.Speak && type !== VoiceRequestType.Warm) ||
    typeof language !== "string" ||
    !checkIsVoiceLanguage(language) ||
    typeof name !== "string" ||
    typeof stem !== "string" ||
    typeof turnId !== "string" ||
    typeof messageId !== "string" ||
    typeof isFinal !== "boolean" ||
    typeof index !== "number" ||
    !Number.isInteger(index) ||
    index < 0 ||
    !Array.isArray(lines) ||
    !lines.every((item) => typeof item === "string") ||
    typeof volume !== "number" ||
    !checkIsVolume(String(volume))
  )
    return undefined;
  else return { index, isFinal, language, lines, messageId, name, stem, turnId, type, volume };
};
