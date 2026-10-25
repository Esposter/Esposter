import type { PublicUser } from "#src/models/user/PublicUser";
import type { RoomInMessage } from "#src/schema/message/roomsInMessage";
import type { UserToRoomInMessage } from "#src/schema/message/usersToRoomsInMessage";

export type UserToRoomInMessageWithRelations = UserToRoomInMessage & { room: RoomInMessage; user: PublicUser };
