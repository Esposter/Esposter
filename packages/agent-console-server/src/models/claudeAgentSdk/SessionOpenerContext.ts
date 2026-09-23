import type { OpenSession } from "#src/models/claudeAgentSdk/OpenSession";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { TaskRegistry } from "#src/models/shared/TaskRegistry";

export interface SessionOpenerContext extends Pick<DriverCallbacks, "onSessionOpen" | "onSessionsChange"> {
  // Reports events for a session, tracking the state they carry on the open session
  emit: (sessionId: string, events: AgentEvent[]) => void;
  openSessionMap: Map<string, OpenSession>;
  // Holds every session's watch until it ends, which is what closing the host waits on
  taskRegistry: TaskRegistry;
}
