// @unocss-include
import type { ConnectionMetadata } from "@/models/message/room/liveKit/ConnectionMetadata";

import { ConnectionQuality } from "livekit-client";

export const ConnectionQualityMetadataMap: Record<ConnectionQuality, ConnectionMetadata> = {
  [ConnectionQuality.Excellent]: { icon: "i-mdi:wifi-strength-4", status: "success", title: "Excellent" },
  [ConnectionQuality.Good]: { icon: "i-mdi:wifi-strength-3", status: "success", title: "Good" },
  [ConnectionQuality.Lost]: { icon: "i-mdi:wifi-strength-outline", status: "error", title: "Lost" },
  [ConnectionQuality.Poor]: { icon: "i-mdi:wifi-strength-1", status: "warning", title: "Poor" },
  [ConnectionQuality.Unknown]: { icon: "i-mdi:wifi-strength-outline", title: "Unknown" },
};
