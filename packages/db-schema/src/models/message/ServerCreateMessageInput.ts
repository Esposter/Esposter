import type { StandardCreateMessageInput } from "#src/models/message/StandardCreateMessageInput";
import type { StandardMessageEntity } from "#src/models/message/StandardMessageEntity";
import type { Except } from "type-fest";

// Any standard type, unlike a member's input: the server also writes the lines a member may not post
export type ServerCreateMessageInput = Except<StandardCreateMessageInput, "type"> &
  Pick<StandardMessageEntity, "isForward" | "isLoading" | "type" | "userId">;
