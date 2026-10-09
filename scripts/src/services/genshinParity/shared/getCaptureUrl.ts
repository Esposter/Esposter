import { YT_CAPTURE_REGEX } from "#src/services/genshinParity/shared/constants";

// The video a clip was downloaded from, read off its file name `yt-<videoId>-<name>.mp4`; undefined for a recording
export const getCaptureUrl = (capture: string): string | undefined => {
  const videoId = YT_CAPTURE_REGEX.exec(capture)?.groups?.videoId;
  return videoId === undefined ? undefined : `https://www.youtube.com/watch?v=${videoId}`;
};
