import type { CharacterMeasurement } from "#src/models/voiceMatch/CharacterMeasurement";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";
import type { ClipDecoder } from "@esposter/genshin-persona/src/models/ClipDecoder.ts";
import type { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";
import type { VoiceSynthesizer } from "@esposter/genshin-persona/src/models/VoiceSynthesizer.ts";

import {
  CARRIER_TEXT,
  LIKENESS_DECIMALS,
  MAX_EMBEDDED_SECONDS,
  MIN_PROFILE_CLIPS,
  MIN_REFERENCE_SECONDS,
  MIN_REFERENCE_SIGNAL_TO_NOISE_DB,
  MODEL_SAMPLE_RATE,
} from "#src/services/voiceMatch/constants";
import { getCosineSimilarity } from "#src/services/voiceMatch/getCosineSimilarity";
import { getMeanEmbedding } from "#src/services/voiceMatch/getMeanEmbedding";
import { readReferenceCandidates } from "#src/services/voiceMatch/readReferenceCandidates";
import { resampleClip } from "@esposter/genshin-persona/src/services/resampleClip.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One character's reference and its likeness. The profile is the centre of their lines' embeddings; the reference
// Is the line nearest it among those long and clean enough to condition a clone on — the most typically them —
// And the likeness is how close a clone of the carrier sentence from that line comes back to the centre. The
// Profile is a working value and is written nowhere
export const measureCharacterReference = async (
  name: string,
  language: VoiceLanguage,
  decoder: ClipDecoder,
  embed: SpeakerEmbedder,
  synthesizer: VoiceSynthesizer,
): Promise<CharacterMeasurement | undefined> => {
  const candidates = await readReferenceCandidates(name, language, decoder, embed);
  if (candidates.length < MIN_PROFILE_CLIPS) return undefined;

  const profile = getMeanEmbedding(candidates.map(({ embedding }) => embedding));
  const [reference] = candidates
    .filter(
      ({ signalToNoiseDb, speechSeconds }) =>
        speechSeconds >= MIN_REFERENCE_SECONDS && signalToNoiseDb >= MIN_REFERENCE_SIGNAL_TO_NOISE_DB,
    )
    .toSorted(
      (firstCandidate, secondCandidate) =>
        getCosineSimilarity(secondCandidate.embedding, profile) -
        getCosineSimilarity(firstCandidate.embedding, profile),
    );
  if (!reference) return undefined;

  const speaker = await synthesizer.encodeReference(reference.clip);
  const carrier = await synthesizer.synthesize(CARRIER_TEXT, speaker);
  // A run that scores silence scores nothing, so an engine with no rung left that speaks ends it
  if (!carrier) throw new InvalidOperationError(Operation.Read, "voice-match", `${name}: silence on every device rung`);

  const carrierEmbedding = await embed(
    resampleClip(carrier, MODEL_SAMPLE_RATE).samples.subarray(0, MODEL_SAMPLE_RATE * MAX_EMBEDDED_SECONDS),
  );
  return {
    clipCount: candidates.length,
    reference: {
      likeness: Number(getCosineSimilarity(carrierEmbedding, profile).toFixed(LIKENESS_DECIMALS)),
      stem: reference.stem,
    },
    referenceSeconds: reference.speechSeconds,
    referenceSignalToNoiseDb: reference.signalToNoiseDb,
  };
};
