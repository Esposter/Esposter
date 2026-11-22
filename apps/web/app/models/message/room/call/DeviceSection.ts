import type { MediaDeviceKind } from "#src/models/message/room/call/MediaDeviceKind";

export interface DeviceSection {
  devices: MediaDeviceInfo[];
  kind: MediaDeviceKind;
  selectedId: string;
  title: string;
}
