import { MediaDeviceKind } from "@/models/message/room/call/MediaDeviceKind";

// Which persisted selection each LiveKit device kind writes to, so writing a pick, restarting the live track on
// A change, and syncing back what the room reports all read one declaration instead of three parallel ones
export const VoiceDeviceSettingsKeyMap = {
  [MediaDeviceKind.Audioinput]: "inputDeviceId",
  [MediaDeviceKind.Audiooutput]: "outputDeviceId",
  [MediaDeviceKind.Videoinput]: "cameraDeviceId",
} as const satisfies Record<MediaDeviceKind, string>;

export const VoiceDeviceKinds = Object.values(MediaDeviceKind);
