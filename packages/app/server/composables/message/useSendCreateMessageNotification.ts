import type { Session } from "#shared/models/auth/Session";
import type { AppUser, MessageEntity } from "@esposter/db-schema";
import type { PushSubscription } from "web-push";

import { getCreateMessageNotificationPayload, RoutePath } from "@esposter/shared";
import webpush from "web-push";

export const useSendCreateMessageNotification = (pushSubscription: PushSubscription | undefined, roomId: string) => {
  const runtimeConfig = useRuntimeConfig();
  return async (
    { message, rowKey }: Pick<MessageEntity, "message" | "rowKey">,
    { image, name }: Partial<Pick<AppUser, "image" | "name"> | Pick<Session["user"], "image" | "name">>,
  ) => {
    if (!pushSubscription) return;

    const payload = getCreateMessageNotificationPayload(message, {
      icon: image,
      title: name,
      url: `${runtimeConfig.public.baseUrl}${RoutePath.MessagesMessage(roomId, rowKey)}`,
    });
    if (!payload) return;

    await webpush.sendNotification(pushSubscription, payload);
  };
};
