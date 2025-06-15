import type { Session } from "@@/server/models/auth/Session";
import type { PushSubscription } from "web-push";

import { useLogoImageUrl } from "#shared/composables/useLogoImageUrl";
import { RoutePath } from "#shared/models/router/RoutePath";
import { truncate } from "#shared/util/text/truncate";
import { PUSH_NOTIFICATION_MAX_LENGTH } from "@@/server/services/esposter/constants";
import webpush from "web-push";

export const useSendCreateMessageNotification = (pushSubscription: PushSubscription | undefined, roomId: string) => {
  const runtimeConfig = useRuntimeConfig();
  const logoImageUrl = useLogoImageUrl();
  return async (message: string, title: Session["user"]["name"], image: Session["user"]["image"]) => {
    if (!pushSubscription) return;
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        body: truncate(message, PUSH_NOTIFICATION_MAX_LENGTH),
        data: {
          url: `${runtimeConfig.public.baseUrl}${RoutePath.Messages(roomId)}`,
        },
        icon: logoImageUrl,
        image,
        title,
      }),
    );
  };
};
