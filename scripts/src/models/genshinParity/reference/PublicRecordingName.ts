import type { VideoSite } from "#src/models/recreation/video/VideoSite";

// What a public recording's file name carries: the site and video id it was downloaded from, and the clip's name
export interface PublicRecordingName {
  id: string;
  name: string;
  site: VideoSite;
}
