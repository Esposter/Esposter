import type { ReferenceCandidate } from "#src/models/voiceMatch/ReferenceCandidate";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";
import type { ClipDecoder } from "@esposter/genshin-persona/src/models/ClipDecoder.ts";
import type { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";

import { MAX_WIKI_TITLES_PER_QUERY, MIN_CLIP_SECONDS, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getClipProfile } from "#src/services/voiceMatch/getClipProfile";
import {
  MAX_REFERENCE_SECONDS,
  VOICE_SAMPLE_RATE,
  WIKI_ENGLISH_VOICE_OVERS_PAGE,
} from "@esposter/genshin-persona/src/services/constants.ts";
import { cutReferenceClip } from "@esposter/genshin-persona/src/services/cutReferenceClip.ts";
import { getWikiFileTitle } from "@esposter/genshin-persona/src/services/getWikiFileTitle.ts";
import { readWikiFile } from "@esposter/genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "@esposter/genshin-persona/src/services/readWikiFileUrls.ts";
import { readWikiStoryLines } from "@esposter/genshin-persona/src/services/readWikiStoryLines.ts";
import { resampleClip } from "@esposter/genshin-persona/src/services/resampleClip.ts";
import { chunk } from "@esposter/shared";

// Every story line of one character in one dub, fetched from the wiki — the same files the plugin fetches a
// Reference from — decoded, cut to the character's own voice as the plugin cuts it, measured and dropped. A line
// The wiki has no file for, or that decodes to nothing or to less than a second, is skipped
export const readReferenceCandidates = async (
  name: string,
  language: VoiceLanguage,
  { decode }: ClipDecoder,
  embed: SpeakerEmbedder,
): Promise<ReferenceCandidate[]> => {
  // A stem is the same in every dub, so the English page names the clips whichever language is fetched
  const lines = await readWikiStoryLines(name, WIKI_ENGLISH_VOICE_OVERS_PAGE);
  // The title batches and the downloads are independent requests, so each set overlaps
  const urlPages = await Promise.all(
    chunk(lines, MAX_WIKI_TITLES_PER_QUERY).map((batch) =>
      readWikiFileUrls(batch.map(({ stem }) => getWikiFileTitle(stem, language))),
    ),
  );
  const urls = new Map<string, string>();
  for (const urlPage of urlPages) for (const [title, url] of urlPage) urls.set(title, url);
  const lineBytes = await Promise.all(
    lines.map(async ({ stem }) => {
      const url = urls.get(getWikiFileTitle(stem, language));
      return { bytes: url ? await readWikiFile(url) : undefined, stem };
    }),
  );

  const candidates: ReferenceCandidate[] = [];
  for (const { bytes, stem } of lineBytes) {
    if (!bytes) continue;
    // oxlint-disable-next-line no-await-in-loop -- One device: the decoder and the embedder below each run one clip at a time
    const decodedClip = await decode(bytes);
    if (!decodedClip) continue;

    const clip = cutReferenceClip(name, decodedClip);
    const modelClip = resampleClip(clip, MODEL_SAMPLE_RATE);
    if (modelClip.samples.length < MODEL_SAMPLE_RATE * MIN_CLIP_SECONDS) continue;

    const { samples } = resampleClip(clip, VOICE_SAMPLE_RATE);
    // oxlint-disable-next-line no-await-in-loop -- One device: the embedder runs one clip at a time
    const profile = await getClipProfile(modelClip, embed);
    candidates.push({
      ...profile,
      clip: { sampleRate: VOICE_SAMPLE_RATE, samples: samples.subarray(0, VOICE_SAMPLE_RATE * MAX_REFERENCE_SECONDS) },
      stem,
    });
  }

  return candidates;
};
