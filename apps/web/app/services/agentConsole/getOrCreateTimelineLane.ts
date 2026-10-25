import type { SessionView } from "@/models/agentConsole/SessionView";

import { getOrCreate } from "@esposter/shared";

export const getOrCreateTimelineLane = (sessionView: SessionView, id: string) =>
  getOrCreate(sessionView.timelineLaneMap, id, () => ({ id, title: "", toolCalls: [] }));
