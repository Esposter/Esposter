import type { StandardCreateMessageInput } from "@/models/message/StandardCreateMessageInput";

import { StandardMessageEntity } from "@/models/message/StandardMessageEntity";

export type ServerCreateMessageInput = Pick<StandardMessageEntity, "isForward" | "isLoading" | "userId"> &
  StandardCreateMessageInput;
