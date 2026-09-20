import type { ClipDecoder } from "#src/models/voiceMatch/ClipDecoder";
import type { ClipLocation } from "#src/models/voiceMatch/ClipLocation";
import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";
import type { VoiceProfile } from "#src/models/voiceMatch/VoiceProfile";

import { MIN_CLIP_SECONDS, MIN_REFERENCE_CLIPS, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getClipProfile } from "#src/services/voiceMatch/getClipProfile";
import { getVoiceProfile } from "#src/services/voiceMatch/getVoiceProfile";
import { getExternalId } from "#src/services/voiceMatch/reference/getExternalId";
import { readFileRange } from "#src/services/voiceMatch/reference/readFileRange";
import { readReferenceVoicefiles } from "#src/services/voiceMatch/reference/readReferenceVoicefiles";
import { resampleClip } from "#src/services/voiceMatch/resampleClip";

// One character's reference, from every clip of theirs the track holds: located by the hash of its recorded stem,
// Decoded, measured and dropped. A clip too short to carry a voice is skipped, and a character with too few left is
// Reported rather than profiled from a handful
export const readCharacterProfile = async (
  name: string,
  clipLocationMap: Map<bigint, ClipLocation>,
  { decode }: ClipDecoder,
  embed: SpeakerEmbedder,
): Promise<undefined | VoiceProfile> => {
  const clipProfiles: ClipProfile[] = [];
  for (const voicefile of readReferenceVoicefiles(name)) {
    const clipLocation = clipLocationMap.get(getExternalId(voicefile));
    if (!clipLocation) continue;

    const bytes = readFileRange(clipLocation.path, clipLocation.entry.offset, clipLocation.entry.size);
    const clip = await decode(bytes);
    if (!clip) continue;

    const resampledClip = resampleClip(clip, MODEL_SAMPLE_RATE);
    if (resampledClip.samples.length < MODEL_SAMPLE_RATE * MIN_CLIP_SECONDS) continue;

    clipProfiles.push(await getClipProfile(resampledClip, embed));
  }

  return clipProfiles.length >= MIN_REFERENCE_CLIPS ? getVoiceProfile(clipProfiles) : undefined;
};
