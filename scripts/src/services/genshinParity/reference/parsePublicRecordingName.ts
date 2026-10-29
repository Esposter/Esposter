import type { PublicRecordingName } from "#src/models/genshinParity/reference/PublicRecordingName";

import { VideoSite } from "#src/models/recreation/video/VideoSite";
import {
  BILIBILI_RECORDING_NAME_REGEX,
  YOUTUBE_RECORDING_NAME_REGEX,
} from "#src/services/genshinParity/reference/constants";

// The site, video id and clip name a file name carries when a public video names it, or undefined for a file that names
// none: one with no clip name, a yt-dlp format part, or a user's own capture
export const parsePublicRecordingName = (fileName: string): PublicRecordingName | undefined => {
  const [, youtubeId, youtubeName] = YOUTUBE_RECORDING_NAME_REGEX.exec(fileName) ?? [];
  if (youtubeId !== undefined && youtubeName !== undefined)
    return { id: youtubeId, name: youtubeName, site: VideoSite.Youtube };
  const [, bilibiliId, bilibiliName] = BILIBILI_RECORDING_NAME_REGEX.exec(fileName) ?? [];
  if (bilibiliId !== undefined && bilibiliName !== undefined)
    return { id: bilibiliId, name: bilibiliName, site: VideoSite.Bilibili };
  return undefined;
};
