import type { OpenSession } from "#src/models/claudeAgentSdk/OpenSession";
import type { SessionOpenerContext } from "#src/models/claudeAgentSdk/SessionOpenerContext";
import type { CanUseTool, PermissionResult } from "@anthropic-ai/claude-agent-sdk";

import { PermissionBehavior } from "#src/models/command/PermissionBehavior";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { toPermissionRequestEvent } from "#src/services/drivers/claudeAgentSdk/toPermissionRequestEvent";
import { toPermissionResult } from "#src/services/drivers/claudeAgentSdk/toPermissionResult";

// The SDK's permission callback, answered from the page. The request waits on a person, as the terminal's prompt
// Does, but never past the turn it belongs to: an interrupt aborts it, and that settles it as a deny.
export const createPermissionBridge =
  (
    sessionId: string,
    pendingPermissionMap: OpenSession["pendingPermissionMap"],
    emit: SessionOpenerContext["emit"],
  ): CanUseTool =>
  (toolName, input, options) =>
    new Promise<PermissionResult>((resolve) => {
      const requestEvent = toPermissionRequestEvent(toolName, input, options, new Date());
      const { requestId } = requestEvent;
      const resolutionId = getEventId(requestId, AgentEventType.PermissionResolution);

      pendingPermissionMap.set(requestId, {
        settle: (behavior, message) => {
          if (!pendingPermissionMap.delete(requestId)) return;

          resolve(toPermissionResult(input, options.suggestions ?? [], behavior, message));
          const createdAt = new Date();
          emit(sessionId, [
            { behavior, createdAt, id: resolutionId, requestId, type: AgentEventType.PermissionResolution },
            {
              createdAt,
              id: getEventId(resolutionId, AgentEventType.SessionState),
              state: SessionState.Running,
              type: AgentEventType.SessionState,
            },
          ]);
        },
      });
      options.signal.addEventListener(
        "abort",
        () => {
          pendingPermissionMap.get(requestId)?.settle(PermissionBehavior.Deny, "");
        },
        { once: true },
      );
      emit(sessionId, [
        requestEvent,
        {
          createdAt: requestEvent.createdAt,
          id: getEventId(requestId, AgentEventType.SessionState),
          state: SessionState.RequiresAction,
          type: AgentEventType.SessionState,
        },
      ]);
    });
