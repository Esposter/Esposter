// Who may perform an operation that a message type supports. Every rule is evaluable on the client — it knows
// The current user id and its own room permission bitfield — so the options menu can never offer an operation
// The procedure will refuse.
export enum MessageOperationPermission {
  // Any member of the room: no authorship, no room permission. Voting in a poll is participating in it, not
  // Authoring it, so it is deliberately not an authorship rule.
  AnyMember = "AnyMember",
  // The message's own author, or a member holding RoomPermission.ManageMessages.
  Author = "Author",
  // RoomPermission.ManageMessages only, for messages with no user author to fall back on.
  ManageMessages = "ManageMessages",
}
