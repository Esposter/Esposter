# Leave Boundaries

Read when something might remove the local participant from a call.

Only these remove the local participant:

- **User intent**: clicking **Leave Call** in room controls, call view, or status bar.
- **Moderation**: `KickFromRoom`, `TimeoutUser`, `CreateBan`, `SoftBan` and `KickFromCall` when `callRoomId` matches — a standalone call has no room to match.
- **Session loss**: logout, tab close, browser crash, RealtimeKit disconnect (`meeting.participantLeft` webhook).
- **`/calls/[id]` unmount**: the standalone page is the whole call surface; leaving the route leaves the call.

A revoke that narrows a connection's publishing is **not** a leave. The connection is kicked and added back, and its user rejoins with the new token; the webhook ignores `meeting.participantLeft` for a connection flagged `isRejoining`, which is set only while that kick is in flight (`references/permissions-and-admin-actions.md`).

Room navigation (`useCallSubscribables` cleanup) is **not** a leave boundary — it only clears `currentRoomCallSessionId` and unsubscribes room observers; never calls `leaveCall` or leaves the RealtimeKit meeting.
