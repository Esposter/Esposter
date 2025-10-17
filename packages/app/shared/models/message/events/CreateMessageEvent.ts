import type { DeviceId } from "#shared/models/auth/DeviceId";
import type { Session } from "#shared/models/auth/Session";
import type { AppUser, MessageEntity } from "@esposter/db-schema";

export type CreateMessageEvent = [
  MessageEntity[],
  (
    | Partial<Pick<AppUser, "image" | "name">>
    | (Pick<DeviceId, "sessionId"> & Pick<Session["user"], "image" | "name"> & { isSendToSelf?: true })
  ),
];
