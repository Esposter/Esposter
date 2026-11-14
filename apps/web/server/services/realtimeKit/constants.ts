// What a moderator takes away from a participant and gives back: the microphone, and the screenshare with its audio.
// Camera is never moderated, so every preset allows it
export enum PublishSource {
  Microphone = "microphone",
  Screenshare = "screenshare",
}
// What a join grants, and so the publishing a participant starts with
export const JOIN_PUBLISH_SOURCES = [PublishSource.Microphone, PublishSource.Screenshare];
// One preset for each publishing a participant can be left in, named for what it allows. Each must exist in the
// RealtimeKit app before a participant is added with it
export const REALTIMEKIT_PRESET_NAME = {
  Camera: "esposter-camera",
  CameraMicrophone: "esposter-camera-microphone",
  CameraMicrophoneScreenshare: "esposter-camera-microphone-screenshare",
  CameraScreenshare: "esposter-camera-screenshare",
} as const;
export const REALTIMEKIT_API_ORIGIN = "https://api.cloudflare.com/client/v4";
// The public key RealtimeKit signs its webhook deliveries with
export const REALTIMEKIT_WEBHOOK_KEY_URL = "https://api.realtime.cloudflare.com/.well-known/webhooks.json";
