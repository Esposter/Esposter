import type { StandardCreateMessageInput } from "#src/models/message/StandardCreateMessageInput";

import { StandardMessageEntity } from "#src/models/message/StandardMessageEntity";

export type ServerCreateMessageInput = Pick<StandardMessageEntity, "isForward" | "isLoading" | "userId"> &
  StandardCreateMessageInput;
