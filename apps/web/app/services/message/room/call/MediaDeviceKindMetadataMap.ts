import type { MediaDeviceKindMetadata } from "@/models/message/room/call/MediaDeviceKindMetadata";

// How the call surfaces name and draw each device kind — the settings menus, the health readout and the device
// Pickers all show the same three, so the spelling lives once.
export const MediaDeviceKindMetadataMap = {
  audioinput: { icon: "mdi-microphone", title: "Microphone" },
  audiooutput: { icon: "mdi-speaker", title: "Speakers" },
  videoinput: { icon: "mdi-video", title: "Camera" },
} as const satisfies Record<MediaDeviceKind, MediaDeviceKindMetadata>;
