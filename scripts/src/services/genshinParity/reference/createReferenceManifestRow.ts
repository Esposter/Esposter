import type { ParityReferenceAttribution } from "#src/models/genshinParity/reference/ParityReferenceAttribution";
import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { RECORDING_SOURCE_REGEX, REFERENCE_ID_LANGUAGE_TAGS } from "#src/services/genshinParity/reference/constants";
import { WIKI_ORIGIN } from "genshin-persona/src/services/constants.ts";

// The manifest row of one reference, read from the entry it serves: a wiki file names its page, a recording's frame names
// its recording, its second and the video's id, and anything else is kind Other with no attribution. The language is the
// one the id names, and a field nothing names is left out rather than guessed
export const createReferenceManifestRow = (
  id: string,
  image: ParityReferenceManifestImage,
  sourceFormat: string,
  { source, wikiTitle }: { source?: string; wikiTitle?: string },
  capturedAt: Date,
): ParityReferenceManifestRow => {
  const recording = source === undefined ? undefined : RECORDING_SOURCE_REGEX.exec(source);
  const language = Object.entries(REFERENCE_ID_LANGUAGE_TAGS).find(([word]) => id.split("-").includes(word))?.[1];
  let kind = ParityReferenceKind.Other;
  let attribution: ParityReferenceAttribution = {};
  if (wikiTitle !== undefined) {
    kind = ParityReferenceKind.Wiki;
    attribution = { wikiTitle, wikiUrl: `${WIKI_ORIGIN}/wiki/${encodeURIComponent(wikiTitle.replaceAll(" ", "_"))}` };
  } else if (recording) {
    const [, recordingFile, second] = recording;
    const videoId = /^yt-([\w-]{11})(?=[-.]|$)/u.exec(recordingFile ?? "")?.[1];
    kind = ParityReferenceKind.RecordingFrame;
    attribution = { recording: recordingFile, second: Number(second), ...(videoId === undefined ? {} : { videoId }) };
  }
  return {
    ...image,
    attribution,
    capturedAt: capturedAt.toISOString(),
    id,
    kind,
    sourceFormat,
    ...(language === undefined ? {} : { language }),
    ...(source === undefined ? {} : { source }),
  };
};
