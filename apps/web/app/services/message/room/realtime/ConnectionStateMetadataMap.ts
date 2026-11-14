// @unocss-include
import type { ConnectionMetadata } from "@/models/message/room/realtime/ConnectionMetadata";

import { ConnectionState } from "@/models/message/room/realtime/ConnectionState";

export const ConnectionStateMetadataMap: Record<ConnectionState, ConnectionMetadata> = {
  [ConnectionState.Connected]: { icon: "i-mdi:check-circle", status: "success", title: "Connected" },
  [ConnectionState.Connecting]: { icon: "i-mdi:loading", status: "info", title: "Connecting" },
  [ConnectionState.Disconnected]: { icon: "i-mdi:minus-circle", title: "Disconnected" },
  [ConnectionState.Reconnecting]: { icon: "i-mdi:refresh", status: "warning", title: "Reconnecting" },
};
