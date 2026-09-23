import type { OpenSession } from "#src/models/claudeAgentSdk/OpenSession";
import type { AgentEvent } from "#src/models/event/AgentEvent";

import { PermissionBehavior } from "#src/models/command/PermissionBehavior";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { DEFAULT_DENY_MESSAGE } from "#src/services/drivers/claudeAgentSdk/constants";
import { createPermissionBridge } from "#src/services/drivers/claudeAgentSdk/createPermissionBridge";
import { describe, expect, test, vi } from "vitest";

const readEventTypes = (emit: ReturnType<typeof vi.fn<(sessionId: string, events: AgentEvent[]) => void>>) =>
  emit.mock.calls.flatMap(([, events]) =>
    events.map((event) => (event.type === AgentEventType.SessionState ? event.state : event.type)),
  );

describe(createPermissionBridge, () => {
  const sessionId = crypto.randomUUID();
  const requestId = crypto.randomUUID();
  const input = { a: "" };
  const suggestions = [{ destination: "session", mode: "acceptEdits", type: "setMode" } as const];

  test("answers the SDK with the verdict and announces it once, however often it is given", async () => {
    expect.hasAssertions();

    const emit = vi.fn<(sessionId: string, events: AgentEvent[]) => void>();
    const pendingPermissionMap: OpenSession["pendingPermissionMap"] = new Map();
    const permissionCallback = createPermissionBridge(sessionId, pendingPermissionMap, emit);
    const pendingResult = permissionCallback("", input, {
      requestId,
      signal: new AbortController().signal,
      suggestions,
      toolUseID: "",
    });
    const pendingPermission = pendingPermissionMap.get(requestId);
    pendingPermission?.settle(PermissionBehavior.AllowAlways, "");
    pendingPermission?.settle(PermissionBehavior.Deny, "");

    await expect(pendingResult).resolves.toStrictEqual({
      behavior: "allow",
      updatedInput: input,
      updatedPermissions: suggestions,
    });
    expect(pendingPermissionMap.size).toBe(0);
    expect(readEventTypes(emit)).toStrictEqual([
      AgentEventType.PermissionRequest,
      SessionState.RequiresAction,
      AgentEventType.PermissionResolution,
      SessionState.Running,
    ]);
    expect(
      emit.mock.calls.flatMap(([, events]) =>
        events.flatMap((event) => (event.type === AgentEventType.PermissionResolution ? [event.behavior] : [])),
      ),
    ).toStrictEqual([PermissionBehavior.AllowAlways]);
  });

  test("settles an abandoned request as a deny, so it never waits past its turn", async () => {
    expect.hasAssertions();

    const emit = vi.fn<(sessionId: string, events: AgentEvent[]) => void>();
    const abortController = new AbortController();
    const permissionCallback = createPermissionBridge(sessionId, new Map(), emit);
    const pendingResult = permissionCallback("", input, { requestId, signal: abortController.signal, toolUseID: "" });
    abortController.abort();

    await expect(pendingResult).resolves.toStrictEqual({ behavior: "deny", message: DEFAULT_DENY_MESSAGE });
    expect(readEventTypes(emit)).toStrictEqual([
      AgentEventType.PermissionRequest,
      SessionState.RequiresAction,
      AgentEventType.PermissionResolution,
      SessionState.Running,
    ]);
  });
});
