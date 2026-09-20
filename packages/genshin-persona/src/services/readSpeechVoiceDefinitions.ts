import type { SpeechVoiceDefinition } from "#src/models/SpeechVoiceDefinition";
import type { SpeechVoiceListEntry } from "#src/models/SpeechVoiceListEntry";

import { SPEECH_TIMEOUT_MS, SPEECH_VOICES_PATH } from "#src/services/constants";
import { getSpeechUrl } from "#src/services/getSpeechUrl";

// The same ceiling the synthesis carries: a resource that takes the connection for the catalogue and never answers
// Would otherwise hold the command open for as long as it cared to
const readVoiceListEntries = async (endpoint: string, key: string): Promise<SpeechVoiceListEntry[] | undefined> => {
  const response = await fetch(getSpeechUrl(endpoint, SPEECH_VOICES_PATH), {
    headers: { "Ocp-Apim-Subscription-Key": key },
    signal: AbortSignal.timeout(SPEECH_TIMEOUT_MS),
  });
  if (!response.ok) return undefined;

  // A body the API promises to be a list and is not — an error document, `null`, an object — is nothing rather
  // Than an entry the caller then walks
  const entries: unknown = await response.json();
  return Array.isArray(entries) ? (entries as SpeechVoiceListEntry[]) : undefined;
};

// Every voice the resource can speak with, as the service lists them now. Nothing here is kept in the repository:
// The catalogue gains and retires voices on Microsoft's schedule, and a copy of it would be wrong by the next patch.
// Nothing rather than a rejection when the resource could not be reached, timed out or answered with a body that is
// Not the JSON its API promises — a settled promise is how each of those is read without a try — because the verb
// Has a sentence and an exit code for a catalogue it could not read, and a stack trace is neither
export const readSpeechVoiceDefinitions = async (
  endpoint: string,
  key: string,
): Promise<SpeechVoiceDefinition[] | undefined> => {
  const [result] = await Promise.allSettled([readVoiceListEntries(endpoint, key)]);
  const entries = result?.status === "fulfilled" ? result.value : undefined;
  if (!entries) return undefined;

  return entries.flatMap<SpeechVoiceDefinition>(({ ShortName, StyleList }) =>
    ShortName ? [{ name: ShortName, styles: StyleList ?? [] }] : [],
  );
};
