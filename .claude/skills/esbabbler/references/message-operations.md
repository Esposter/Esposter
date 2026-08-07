# Message operations — capability and permission are separate questions

Read when adding a message operation or a `MessageType`, or gating a message menu item on who may use it. `MessageTypeOperationPermissionMap` (`shared/services/message/`) is the single source of truth for what may be done to a message; it answers two questions that must not be collapsed:

- **Capability** — does this operation exist for this `MessageType` at all? True regardless of who asks. A Poll has no editable body, so `Update` is simply absent for it.
- **Permission** — for an operation that exists, may _this_ caller perform it? `MessageOperationPermission` is `AnyMember | Author | ManageMessages`.

Presence in the map encodes capability; the value encodes permission. The outer `Record<MessageType, …>` is exhaustive, so a new message type cannot ship without answering the question for every operation.

The two produce **different failure modes**, and conflating them is what lets a client offer actions the server refuses:

- an operation the type does not declare → `BAD_REQUEST`, for every caller **including one holding `ManageMessages`**. A moderator still cannot edit a poll's body, because that operation does not exist — it is not a permission they are missing.
- an operation it declares but this caller may not perform → `UNAUTHORIZED`.

Rules:

- The permission rule must stay a **declarative discriminant the client can evaluate too** — `useMessageActionItems` reads the same map, which is what makes "the UI cannot offer what the procedure will refuse" structural rather than a convention. A server-only predicate reintroduces the two-sources-of-truth bug.
- Menu items gate on **capability** where the action is neither authored nor moderated (Reply, Forward), and on **permission** where it is (Delete, Pin). Gating Reply on permission silently removes it from every message a member did not write.
- Webhook messages have no author, so their rules resolve to `ManageMessages`, never `Author`.
- A distinct operation gets its own procedure rather than being smuggled through a similar one — casting a vote is not editing a body, so `votePoll` exists instead of widening `updateMessage` to Poll.
