import { PublishSource } from "@esposter/db-schema";
import { SITE_NAME } from "@esposter/shared";

// What a join grants, and so the publishing a participant starts with
export const JOIN_PUBLISH_SOURCES = [PublishSource.Microphone, PublishSource.Screenshare];
// One preset for each publishing a participant can be left in, named for what it allows. Each must exist in the
// RealtimeKit app before a participant is added with it
export const REALTIMEKIT_PRESET_NAME = {
  Camera: `${SITE_NAME.toLowerCase()}-camera`,
  CameraMicrophone: `${SITE_NAME.toLowerCase()}-camera-microphone`,
  CameraMicrophoneScreenshare: `${SITE_NAME.toLowerCase()}-camera-microphone-screenshare`,
  CameraScreenshare: `${SITE_NAME.toLowerCase()}-camera-screenshare`,
} as const;
export const REALTIMEKIT_API_ORIGIN = "https://api.cloudflare.com/client/v4";
