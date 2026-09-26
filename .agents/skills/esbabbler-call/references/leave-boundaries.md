# Leave Boundaries

Read when something might remove the local participant from a call.

Only these remove the local participant:

- **User intent**: clicking **Leave Call** in room controls, call view, or status bar.
- **Moderation**: `KickFromRoom`, `TimeoutUser`, `CreateBan` when `callRoomId` matches, and `KickFromCall` whichever call the user is in — a standalone call has no room to match.
- **Session loss**: logout, tab close, browser crash, LiveKit disconnect (`participant_left` webhook).
- **`/calls/[id]` unmount**: the standalone page is the whole call surface; leaving the route leaves the call.

Room navigation (`useCallSubscribables` cleanup) is **not** a leave boundary — it only clears `currentRoomCallSessionId` and unsubscribes room observers; never calls `leaveCall` or disconnects LiveKit.
