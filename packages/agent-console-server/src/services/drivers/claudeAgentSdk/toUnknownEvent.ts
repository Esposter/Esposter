import type { UnknownEvent } from "#src/models/event/UnknownEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";

export const toUnknownEvent = (id: string, sdkType: string, raw: string, createdAt: Date): UnknownEvent => ({
  createdAt,
  id,
  raw,
  sdkType,
  type: AgentEventType.Unknown,
});
