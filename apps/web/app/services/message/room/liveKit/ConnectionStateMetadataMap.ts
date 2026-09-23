// @unocss-include
import type { Item } from "@/models/shared/Item";

import { ConnectionState } from "livekit-client";

export const ConnectionStateMetadataMap: Record<ConnectionState, Item> = {
  [ConnectionState.Connected]: { color: "success", icon: "i-mdi:check-circle", title: "Connected" },
  [ConnectionState.Connecting]: { color: "info", icon: "i-mdi:loading", title: "Connecting" },
  [ConnectionState.Disconnected]: { icon: "i-mdi:minus-circle", title: "Disconnected" },
  [ConnectionState.Reconnecting]: { color: "warning", icon: "i-mdi:refresh", title: "Reconnecting" },
  [ConnectionState.SignalReconnecting]: { color: "warning", icon: "i-mdi:refresh", title: "Signal Reconnecting" },
};
