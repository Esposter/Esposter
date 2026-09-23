import type { ClipDecoder } from "#src/models/ClipDecoder";
import type { PcmClip } from "#src/models/PcmClip";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { MAX_REFERENCE_SECONDS, VOICE_SAMPLE_RATE, WIKI_ENGLISH_VOICE_OVERS_PAGE } from "#src/services/constants";
import { cutReferenceClip } from "#src/services/cutReferenceClip";
import { getReferencePath } from "#src/services/getReferencePath";
import { getWikiFileTitle } from "#src/services/getWikiFileTitle";
import { readWikiFile } from "#src/services/readWikiFile";
import { readWikiFileUrls } from "#src/services/readWikiFileUrls";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";
import { resampleClip } from "#src/services/resampleClip";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// A character the reference selection could not measure is spoken from the longest story line the wiki lists —
// Spoken, never silent; a stem is the same in every dub, so the English page names it
const readLongestStoryStem = async (name: string) => {
  const lines = await readWikiStoryLines(name, WIKI_ENGLISH_VOICE_OVERS_PAGE);
  const [longest] = lines.toSorted((a, b) => b.text.length - a.text.length);
  return longest?.stem ?? "";
};
// One character's reference in one dub, fetched from the wiki the first time it is needed and cached in the state
// Directory after — never committed — then decoded, cut to the character's own voice, brought to the engine's rate
// And trimmed to what it conditions on. Nothing for a line the wiki no longer holds under that name
export const readReferenceClip = async (
  name: string,
  stem: string,
  language: VoiceLanguage,
  { decode }: ClipDecoder,
): Promise<PcmClip | undefined> => {
  const referenceStem = stem || (await readLongestStoryStem(name));
  if (!referenceStem) return undefined;

  const referencePath = getReferencePath(referenceStem, language);
  if (!existsSync(referencePath)) {
    const title = getWikiFileTitle(referenceStem, language);
    const urls = await readWikiFileUrls([title]);
    const url = urls.get(title);
    if (!url) return undefined;

    const bytes = await readWikiFile(url);
    if (!bytes) return undefined;

    mkdirSync(dirname(referencePath), { recursive: true });
    writeFileSync(referencePath, bytes);
  }

  const clip = await decode(readFileSync(referencePath));
  if (!clip) return undefined;

  const ownClip = cutReferenceClip(name, clip);
  const { samples } = resampleClip(ownClip, VOICE_SAMPLE_RATE);
  return { sampleRate: VOICE_SAMPLE_RATE, samples: samples.subarray(0, VOICE_SAMPLE_RATE * MAX_REFERENCE_SECONDS) };
};
