// A realtime event may exist beside the topics that keep a stored read current only by carrying what a topic cannot.
// Each class names one such thing, and none of them is a refresh of a stored read
export const EventClass = {
  // State that is never stored and only the sockets hold: typing, call participants, knocks and the Genshin lease
  Ephemeral: "ephemeral",
  // The room socket's own stream of messages and their reactions
  MessageStream: "messageStream",
  // A change to a room-list row: a room moved to the top, added, removed or edited
  RowChange: "rowChange",
  // A value the design records as pushed on purpose, carried whole and written to the store as it is
  ValuePush: "valuePush",
} as const;
export type EventClass = (typeof EventClass)[keyof typeof EventClass];
