import type { Item } from "@/models/shared/Item";

import { ConnectionState } from "livekit-client";

export const ConnectionStateMetadataMap: Record<ConnectionState, Item> = {
  [ConnectionState.Connected]: { color: "success", icon: "mdi-check-circle", title: "Connected" },
  [ConnectionState.Connecting]: { color: "info", icon: "mdi-loading", title: "Connecting" },
  [ConnectionState.Disconnected]: { icon: "mdi-minus-circle", title: "Disconnected" },
  [ConnectionState.Reconnecting]: { color: "warning", icon: "mdi-refresh", title: "Reconnecting" },
  [ConnectionState.SignalReconnecting]: { color: "warning", icon: "mdi-refresh", title: "Signal Reconnecting" },
};
