import type { ReferenceCandidate } from "#src/models/voiceMatch/ReferenceCandidate";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";
import type { ClipDecoder } from "@esposter/genshin-persona/src/models/ClipDecoder.ts";
import type { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";

import { MAX_WIKI_TITLES_PER_QUERY, MIN_CLIP_SECONDS, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getClipProfile } from "#src/services/voiceMatch/getClipProfile";
import { MAX_REFERENCE_SECONDS, VOICE_SAMPLE_RATE } from "@esposter/genshin-persona/src/services/constants.ts";
import { cutReferenceClip } from "@esposter/genshin-persona/src/services/cutReferenceClip.ts";
import { getWikiFileTitle } from "@esposter/genshin-persona/src/services/getWikiFileTitle.ts";
import { readWikiFile } from "@esposter/genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "@esposter/genshin-persona/src/services/readWikiFileUrls.ts";
import { readWikiStoryLines } from "@esposter/genshin-persona/src/services/readWikiStoryLines.ts";
import { resampleClip } from "@esposter/genshin-persona/src/services/resampleClip.ts";

// Every story line of one character in one dub, fetched from the wiki — the same files the plugin fetches a
// Reference from — decoded, cut to the character's own voice as the plugin cuts it, measured and dropped. A line
// The wiki has no file for, or that decodes to nothing or to less than a second, is skipped
export const readReferenceCandidates = async (
  name: string,
  language: VoiceLanguage,
  { decode }: ClipDecoder,
  embed: SpeakerEmbedder,
): Promise<ReferenceCandidate[]> => {
  const lines = await readWikiStoryLines(name);
  const urls = new Map<string, string>();
  for (let start = 0; start < lines.length; start += MAX_WIKI_TITLES_PER_QUERY) {
    const titles = lines
      .slice(start, start + MAX_WIKI_TITLES_PER_QUERY)
      .map(({ stem }) => getWikiFileTitle(stem, language));
    for (const [title, url] of await readWikiFileUrls(titles)) urls.set(title, url);
  }

  const candidates: ReferenceCandidate[] = [];
  for (const { stem } of lines) {
    const url = urls.get(getWikiFileTitle(stem, language));
    if (!url) continue;

    const bytes = await readWikiFile(url);
    if (!bytes) continue;

    const decodedClip = await decode(bytes);
    if (!decodedClip) continue;

    const clip = cutReferenceClip(name, decodedClip);
    const modelClip = resampleClip(clip, MODEL_SAMPLE_RATE);
    if (modelClip.samples.length < MODEL_SAMPLE_RATE * MIN_CLIP_SECONDS) continue;

    const { samples } = resampleClip(clip, VOICE_SAMPLE_RATE);
    const profile = await getClipProfile(modelClip, embed);
    candidates.push({
      ...profile,
      clip: { sampleRate: VOICE_SAMPLE_RATE, samples: samples.subarray(0, VOICE_SAMPLE_RATE * MAX_REFERENCE_SECONDS) },
      stem,
    });
  }

  return candidates;
};
