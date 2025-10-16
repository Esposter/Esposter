import type { Session } from "#shared/models/auth/Session";
import type { AppUser, MessageEntity } from "@esposter/db-schema";
import type { PushSubscription } from "web-push";

import { RoutePath } from "#shared/models/router/RoutePath";
import { truncate } from "#shared/util/text/truncate";
import { PUSH_NOTIFICATION_MAX_LENGTH } from "@@/server/services/message/constants";
import { parse } from "node-html-parser";
import webpush from "web-push";

export const useSendCreateMessageNotification = (pushSubscription: PushSubscription | undefined, roomId: string) => {
  const runtimeConfig = useRuntimeConfig();
  return async (
    { message, rowKey }: Pick<MessageEntity, "message" | "rowKey">,
    { image, name }: Partial<Pick<AppUser, "image" | "name"> | Pick<Session["user"], "image" | "name">>,
  ) => {
    if (!pushSubscription) return;

    let textContent: string | undefined = message;

    try {
      textContent = parse(message).querySelector("p")?.textContent;
      // eslint-disable-next-line no-empty
    } catch {}

    if (!textContent) return;

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        body: truncate(textContent, PUSH_NOTIFICATION_MAX_LENGTH),
        data: {
          url: `${runtimeConfig.public.baseUrl}${RoutePath.MessagesMessage(roomId, rowKey)}`,
        },
        icon: image,
        title: name,
      }),
    );
  };
};
