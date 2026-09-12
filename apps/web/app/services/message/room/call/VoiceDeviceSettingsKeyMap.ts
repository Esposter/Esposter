// Which persisted selection each LiveKit device kind writes to, so writing a pick, restarting the live track on
// A change, and syncing back what the room reports all read one declaration instead of three parallel ones
export const VoiceDeviceSettingsKeyMap = {
  audioinput: "inputDeviceId",
  audiooutput: "outputDeviceId",
  videoinput: "cameraDeviceId",
} as const satisfies Record<MediaDeviceKind, string>;

export const VoiceDeviceKinds = Object.keys(VoiceDeviceSettingsKeyMap) as MediaDeviceKind[];
