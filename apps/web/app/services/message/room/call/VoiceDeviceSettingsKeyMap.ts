import { MediaDeviceKind } from "@/models/message/room/call/MediaDeviceKind";

// Which persisted selection each device kind writes to, so writing a pick, switching the live device on a
// Change, and reading the picks back all share one declaration instead of three parallel ones
export const VoiceDeviceSettingsKeyMap = {
  [MediaDeviceKind.Audioinput]: "inputDeviceId",
  [MediaDeviceKind.Audiooutput]: "outputDeviceId",
  [MediaDeviceKind.Videoinput]: "cameraDeviceId",
} as const satisfies Record<MediaDeviceKind, string>;

export const VoiceDeviceKinds = Object.values(MediaDeviceKind);
