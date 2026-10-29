import type { ParityRecordingManifestRow } from "#src/models/genshinParity/reference/ParityRecordingManifestRow";
import type { PublicRecordingName } from "#src/models/genshinParity/reference/PublicRecordingName";

import { VideoSite } from "#src/models/recreation/video/VideoSite";

// The manifest row of a public recording a file holds: its public page is its source, and it names no range, since the
// seconds it was cut at live in the map entries that cite it. Its bytes are not uploaded, so the clip tool fetches it
// again from its public page
export const createPublicRecordingRow = ({
  bytes,
  id,
  name,
  sha256,
  site,
  sourceFormat,
}: Pick<ParityRecordingManifestRow, "bytes" | "name" | "sha256" | "sourceFormat"> &
  Pick<PublicRecordingName, "id" | "site">): ParityRecordingManifestRow => ({
  attribution: {},
  bytes,
  name,
  sha256,
  source: site === VideoSite.Youtube ? `https://www.youtube.com/watch?v=${id}` : `https://www.bilibili.com/video/${id}`,
  sourceFormat,
});
