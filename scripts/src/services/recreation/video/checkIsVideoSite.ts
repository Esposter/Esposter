import { VideoSite } from "#src/models/recreation/video/VideoSite";

export const checkIsVideoSite = (site: string): site is VideoSite => Object.values<string>(VideoSite).includes(site);
