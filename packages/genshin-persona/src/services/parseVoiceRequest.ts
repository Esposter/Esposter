import type { VoiceRequest } from "#src/models/VoiceRequest";

import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { checkIsVoiceLanguage } from "#src/services/checkIsVoiceLanguage";
import { checkIsVolume } from "#src/services/checkIsVolume";
import { parseJsonObject } from "#src/services/parseJsonObject";

// One line off the socket as a request, or nothing for a line that is not one: the socket is a local path anything
// On the machine can write to, so every field is checked before the synthesizer acts on it. A line that is not
// JSON at all throws, and the server answers that as it answers any request that fails
export const parseVoiceRequest = (line: string): undefined | VoiceRequest => {
  const { language, lines, name, stem, turnId, type, volume } = parseJsonObject(line);
  if (type === VoiceRequestType.Stop) return { type };
  if (type !== VoiceRequestType.Speak && type !== VoiceRequestType.Warm) return undefined;
  if (typeof language !== "string" || !checkIsVoiceLanguage(language)) return undefined;
  if (typeof name !== "string" || typeof stem !== "string" || typeof turnId !== "string") return undefined;
  if (!Array.isArray(lines) || !lines.every((item) => typeof item === "string")) return undefined;
  if (typeof volume !== "number" || !checkIsVolume(String(volume))) return undefined;
  else return { language, lines, name, stem, turnId, type, volume };
};
