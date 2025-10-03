import type { Session } from "@@/server/models/auth/Session";
import type { PushSubscription } from "web-push";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { RoutePath } from "#shared/models/router/RoutePath";
import { truncate } from "#shared/util/text/truncate";
import { PUSH_NOTIFICATION_MAX_LENGTH } from "@@/server/services/message/constants";
import { parse } from "node-html-parser";
import webpush from "web-push";

export const useSendCreateMessageNotification = (pushSubscription: PushSubscription | undefined, roomId: string) => {
  const runtimeConfig = useRuntimeConfig();
  return async (
    { message, rowKey }: Pick<MessageEntity, "message" | "rowKey">,
    title: Session["user"]["name"],
    icon: Session["user"]["image"],
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
        icon,
        title,
      }),
    );
  };
};
