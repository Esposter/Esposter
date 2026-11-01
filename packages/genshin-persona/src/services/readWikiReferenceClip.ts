import type { ClipDecoder } from "#src/models/ClipDecoder";
import type { PcmClip } from "#src/models/PcmClip";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { getWikiFileTitle } from "#src/services/getWikiFileTitle";
import { readWikiFile } from "#src/services/readWikiFile";
import { readWikiFileUrls } from "#src/services/readWikiFileUrls";
import { writeStateFile } from "#src/services/writeStateFile";

// A reference clip as the wiki holds it, written into the state directory only once it decodes — so the cache never
// Holds bytes that will not play. Nothing for a line the wiki no longer holds under that name
export const readWikiReferenceClip = async (
  stem: string,
  language: VoiceLanguage,
  referencePath: string,
  { decode }: ClipDecoder,
): Promise<PcmClip | undefined> => {
  const title = getWikiFileTitle(stem, language);
  const urls = await readWikiFileUrls([title]);
  const url = urls.get(title);
  if (!url) return undefined;

  const bytes = await readWikiFile(url);
  if (!bytes) return undefined;

  const clip = await decode(bytes);
  if (clip) writeStateFile(referencePath, bytes);
  return clip;
};
