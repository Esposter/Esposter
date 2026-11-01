import type { ClipDecoder } from "#src/models/ClipDecoder";
import type { PcmClip } from "#src/models/PcmClip";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { MAX_REFERENCE_SECONDS, VOICE_SAMPLE_RATE } from "#src/services/constants";
import { cutReferenceClip } from "#src/services/cutReferenceClip";
import { getReferencePath } from "#src/services/getReferencePath";
import { readWikiReferenceClip } from "#src/services/readWikiReferenceClip";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";
import { resampleClip } from "#src/services/resampleClip";
import { existsSync, readFileSync } from "node:fs";

// A character the reference selection could not measure is spoken from the longest story line the wiki lists —
// Spoken, never silent; a stem is the same in every dub, so the English page names it
const readLongestStoryStem = async (name: string) => {
  const lines = await readWikiStoryLines(name);
  const [longest] = lines.toSorted((firstLine, secondLine) => secondLine.text.length - firstLine.text.length);
  return longest?.stem ?? "";
};
// One character's reference in one dub, fetched from the wiki the first time it is needed and cached in the state
// Directory after — never committed — then decoded, cut to the character's own voice, brought to the engine's rate
// And trimmed to what it conditions on. Nothing for a line the wiki no longer holds under that name
export const readReferenceClip = async (
  name: string,
  stem: string,
  language: VoiceLanguage,
  decoder: ClipDecoder,
): Promise<PcmClip | undefined> => {
  const referenceStem = stem || (await readLongestStoryStem(name));
  if (!referenceStem) return undefined;

  const referencePath = getReferencePath(referenceStem, language);
  // A cached file that no longer decodes — an earlier session's write cut short — is fetched again and overwritten
  const cachedClip = existsSync(referencePath) ? await decoder.decode(readFileSync(referencePath)) : undefined;
  const clip = cachedClip ?? (await readWikiReferenceClip(referenceStem, language, referencePath, decoder));
  if (!clip) return undefined;

  const ownClip = cutReferenceClip(name, clip);
  const { samples } = resampleClip(ownClip, VOICE_SAMPLE_RATE);
  return { sampleRate: VOICE_SAMPLE_RATE, samples: samples.subarray(0, VOICE_SAMPLE_RATE * MAX_REFERENCE_SECONDS) };
};
