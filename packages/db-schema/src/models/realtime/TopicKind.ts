// What a topic's id names. A kind is one entity, or one list read by an owner: `room` is a room's settings, roles,
// Categories, emojis and members, `roomList` the rooms a user is in, and `feed` the public post feed, whose id is the
// Feed's name
export const TopicKind = {
  Block: "block",
  Bookmark: "bookmark",
  Clicker: "clicker",
  Dungeons: "dungeons",
  Feed: "feed",
  Friend: "friend",
  FriendRequest: "friendRequest",
  Notification: "notification",
  Post: "post",
  Resource: "resource",
  ResourceList: "resourceList",
  Room: "room",
  RoomList: "roomList",
  ScheduledMessage: "scheduledMessage",
  SearchHistory: "searchHistory",
  Session: "session",
  ThreadFollow: "threadFollow",
  User: "user",
  Webhook: "webhook",
} as const;
export type TopicKind = (typeof TopicKind)[keyof typeof TopicKind];
