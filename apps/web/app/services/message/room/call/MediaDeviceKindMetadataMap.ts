// @unocss-include
import type { MediaDeviceKindMetadata } from "@/models/message/room/call/MediaDeviceKindMetadata";

import { MediaDeviceKind } from "@/models/message/room/call/MediaDeviceKind";

// How the call surfaces name and draw each device kind — the settings menus, the health readout and the device
// Pickers all show the same three, so the spelling lives once.
export const MediaDeviceKindMetadataMap = {
  [MediaDeviceKind.Audioinput]: { icon: "i-mdi:microphone", title: "Microphone" },
  [MediaDeviceKind.Audiooutput]: { icon: "i-mdi:speaker", title: "Speakers" },
  [MediaDeviceKind.Videoinput]: { icon: "i-mdi:video", title: "Camera" },
} as const satisfies Record<MediaDeviceKind, MediaDeviceKindMetadata>;
