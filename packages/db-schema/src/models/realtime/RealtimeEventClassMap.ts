import type { CallEvent } from "#src/models/realtime/CallEvent";
import type { RoomEvent } from "#src/models/realtime/RoomEvent";
import type { UserEvent } from "#src/models/realtime/UserEvent";

import { EventClass } from "#src/models/realtime/EventClass";
import { RealtimeEventType } from "#src/models/realtime/RealtimeEventType";

// The class of every event type a realtime object sends. Two have none, so they are left out of the keys on purpose.
// Each is a finding for its owner.
// `saveResourceContent` makes its subscribers re-read a stored content through a read no topic watches
// `invalidate` is the topic watch's own frame
export const RealtimeEventClassMap = {
  [RealtimeEventType.AdminAction]: EventClass.Command,
  [RealtimeEventType.CreateEmoji]: EventClass.MessageStream,
  [RealtimeEventType.CreateMessage]: EventClass.MessageStream,
  [RealtimeEventType.CreateTyping]: EventClass.Ephemeral,
  [RealtimeEventType.DeleteEmoji]: EventClass.MessageStream,
  [RealtimeEventType.DeleteMessage]: EventClass.MessageStream,
  [RealtimeEventType.DeleteRoom]: EventClass.RowChange,
  [RealtimeEventType.HandRaisedChanged]: EventClass.Ephemeral,
  [RealtimeEventType.JoinCall]: EventClass.Ephemeral,
  [RealtimeEventType.JoinRoom]: EventClass.RowChange,
  [RealtimeEventType.KnockCall]: EventClass.Ephemeral,
  [RealtimeEventType.KnockerAdmitted]: EventClass.Ephemeral,
  [RealtimeEventType.KnockerDismissed]: EventClass.Ephemeral,
  [RealtimeEventType.LeaveCall]: EventClass.Ephemeral,
  [RealtimeEventType.LeaveRoom]: EventClass.RowChange,
  [RealtimeEventType.MuteChanged]: EventClass.Ephemeral,
  [RealtimeEventType.ReplaceSession]: EventClass.Ephemeral,
  [RealtimeEventType.RoomActivity]: EventClass.RowChange,
  [RealtimeEventType.UpdateAchievement]: EventClass.ValuePush,
  [RealtimeEventType.UpdateEmoji]: EventClass.MessageStream,
  [RealtimeEventType.UpdateMessage]: EventClass.MessageStream,
  [RealtimeEventType.UpdateRoom]: EventClass.RowChange,
  [RealtimeEventType.UpdateUsage]: EventClass.ValuePush,
  [RealtimeEventType.UpdateUserToRoom]: EventClass.ValuePush,
  [RealtimeEventType.UpsertStatus]: EventClass.ValuePush,
  [RealtimeEventType.VideoChanged]: EventClass.Ephemeral,
} as const satisfies Record<
  Exclude<
    CallEvent["type"] | RoomEvent["type"] | UserEvent["type"],
    typeof RealtimeEventType.Invalidate | typeof RealtimeEventType.SaveResourceContent
  >,
  EventClass
>;
