import type { MediaDeviceKind } from "#src/models/message/room/call/MediaDeviceKind";

export interface CallDeviceDefinition {
  kind: MediaDeviceKind;
  selectedId: Ref<string>;
}
