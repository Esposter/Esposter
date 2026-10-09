import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { VoiceModel } from "#src/models/VoiceModel";
import type { VoiceRuntime } from "#src/models/VoiceRuntime";

import { VOICE_DECODER_SILENCE_TOKEN_COUNT, VOICE_SILENCE_TOKEN } from "#src/services/constants";

// The decoder run over the speech tokens made so far, framed as the generation frames its own final pass: the
// Reference's tokens, the tokens, then the silence the decoder pads with. The waveform is the whole prefix again
export const vocodeSpeechTokens = async (
  { sessions }: VoiceModel,
  Tensor: VoiceRuntime["Tensor"],
  speaker: SpeakerTensors,
  tokens: bigint[],
): Promise<Float32Array> => {
  const speechTokens = [
    ...Array.from(speaker.audio_tokens.data, BigInt),
    ...tokens,
    ...Array.from({ length: VOICE_DECODER_SILENCE_TOKEN_COUNT }, () => VOICE_SILENCE_TOKEN),
  ];
  const { waveform } = await sessions.conditional_decoder.run({
    speaker_embeddings: speaker.speaker_embeddings,
    speaker_features: speaker.speaker_features,
    speech_tokens: new Tensor("int64", BigInt64Array.from(speechTokens), [1, speechTokens.length]),
  });
  return Float32Array.from(waveform.data, Number);
};
