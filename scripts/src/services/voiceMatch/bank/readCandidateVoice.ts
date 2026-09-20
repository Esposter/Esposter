import type { CandidateVoice } from "#src/models/voiceMatch/CandidateVoice";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";
import type { Transcriber } from "#src/models/voiceMatch/Transcriber";
import type { SpeechVoiceDefinition } from "@esposter/genshin-persona/src/models/SpeechVoiceDefinition.ts";

import { getWordErrorRate } from "#src/services/voiceMatch/bank/getWordErrorRate";
import { readWavClip } from "#src/services/voiceMatch/bank/readWavClip";
import { CARRIER_TEXT, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getClipProfile } from "#src/services/voiceMatch/getClipProfile";
import { getVoiceProfile } from "#src/services/voiceMatch/getVoiceProfile";
import { resampleClip } from "#src/services/voiceMatch/resampleClip";
import { synthesizeSpeech } from "@esposter/genshin-persona/src/services/synthesizeSpeech.ts";

// One catalogue voice reading the carrier at its own settings, through the same markup the plugin speaks with, then
// Measured like a reference clip and transcribed for the intelligibility gate. Nothing for a voice the service
// Declines to synthesize
export const readCandidateVoice = async (
  { name, styles }: SpeechVoiceDefinition,
  endpoint: string,
  key: string,
  embed: SpeakerEmbedder,
  transcribe: Transcriber,
): Promise<CandidateVoice | undefined> => {
  const audio = await synthesizeSpeech({ endpoint, key, text: CARRIER_TEXT, voice: { name }, volume: "" });
  if (!audio) return undefined;

  const clip = readWavClip(Buffer.from(audio));
  const resampledClip = resampleClip(clip, MODEL_SAMPLE_RATE);
  const clipProfile = await getClipProfile(resampledClip, embed);
  const heard = await transcribe(resampledClip.samples);
  return {
    name,
    profile: getVoiceProfile([clipProfile]),
    styles,
    wordErrorRate: getWordErrorRate(CARRIER_TEXT, heard),
  };
};
