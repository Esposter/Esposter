import type { Session } from "@@/server/models/auth/Session";
import type { PushSubscription } from "web-push";

import { RoutePath } from "#shared/models/router/RoutePath";
import { SITE_NAME } from "#shared/services/esposter/constants";
import { truncate } from "#shared/util/text/truncate";
import { PUSH_NOTIFICATION_MAX_LENGTH } from "@@/server/services/esposter/constants";
import { parse } from "node-html-parser";
import webpush from "web-push";

export const useSendCreateMessageNotification = (pushSubscription: PushSubscription | undefined, roomId: string) => {
  const runtimeConfig = useRuntimeConfig();
  return async (message: string, name: Session["user"]["name"], icon: Session["user"]["image"]) => {
    if (!pushSubscription) return;

    const messageHtml = parse(message);
    const textContent = messageHtml.querySelector("p")?.textContent;
    if (!textContent) return;

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        body: truncate(`${name}: ${textContent}`, PUSH_NOTIFICATION_MAX_LENGTH),
        data: {
          url: `${runtimeConfig.public.baseUrl}${RoutePath.Messages(roomId)}`,
        },
        icon,
        title: SITE_NAME,
      }),
    );
  };
};
