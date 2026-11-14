// @unocss-include
import type { ConnectionMetadata } from "@/models/message/room/realtime/ConnectionMetadata";

import { ConnectionQuality } from "@/models/message/room/realtime/ConnectionQuality";

export const ConnectionQualityMetadataMap: Record<ConnectionQuality, ConnectionMetadata> = {
  [ConnectionQuality.Good]: { icon: "i-mdi:wifi-strength-3", status: "success", title: "Good" },
  [ConnectionQuality.Poor]: { icon: "i-mdi:wifi-strength-1", status: "warning", title: "Poor" },
  [ConnectionQuality.Unknown]: { icon: "i-mdi:wifi-strength-outline", title: "Unknown" },
};
