import type { Item } from "@/models/shared/Item";

import { ConnectionQuality } from "livekit-client";

export const ConnectionQualityMetadataMap: Record<ConnectionQuality, Item> = {
  [ConnectionQuality.Excellent]: { color: "success", icon: "mdi-wifi-strength-4", title: "Excellent" },
  [ConnectionQuality.Good]: { color: "success", icon: "mdi-wifi-strength-3", title: "Good" },
  [ConnectionQuality.Lost]: { color: "error", icon: "mdi-wifi-strength-outline", title: "Lost" },
  [ConnectionQuality.Poor]: { color: "warning", icon: "mdi-wifi-strength-1", title: "Poor" },
  [ConnectionQuality.Unknown]: { icon: "mdi-wifi-strength-outline", title: "Unknown" },
};
