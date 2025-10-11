import type { BaseCreateMessageInput } from "@/models/message/BaseCreateMessageInput";

import { BaseMessageEntity } from "@/models/message/BaseMessageEntity";

export type ServerCreateMessageInput = BaseCreateMessageInput &
  Pick<BaseMessageEntity, "isForward" | "isLoading" | "userId">;
