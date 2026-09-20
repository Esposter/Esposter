import type { SpeechVoiceDefinition } from "#src/models/SpeechVoiceDefinition";
import type { SpeechVoiceListEntry } from "#src/models/SpeechVoiceListEntry";

import { SPEECH_VOICES_PATH } from "#src/services/constants";
import { getSpeechUrl } from "#src/services/getSpeechUrl";

// Every voice the resource can speak with, as the service lists them now. Nothing here is kept in the repository:
// The catalogue gains and retires voices on Microsoft's schedule, and a copy of it would be wrong by the next patch
export const readSpeechVoiceDefinitions = async (
  endpoint: string,
  key: string,
): Promise<SpeechVoiceDefinition[] | undefined> => {
  const response = await fetch(getSpeechUrl(endpoint, SPEECH_VOICES_PATH), {
    headers: { "Ocp-Apim-Subscription-Key": key },
  });
  if (!response.ok) return undefined;

  const entries = (await response.json()) as SpeechVoiceListEntry[];
  return entries.flatMap<SpeechVoiceDefinition>(({ ShortName, StyleList }) =>
    ShortName ? [{ name: ShortName, styles: StyleList ?? [] }] : [],
  );
};
