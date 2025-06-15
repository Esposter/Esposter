import type { PushSubscription } from "web-push";

import { useLogoImageUrl } from "#shared/composables/useLogoImageUrl";
import { truncate } from "#shared/util/text/truncate";
import { PUSH_NOTIFICATION_MAX_LENGTH } from "@@/server/services/esposter/constants";
import webpush from "web-push";

export const useSendCreateMessageNotification = (pushSubscription: PushSubscription | undefined, roomName: string) => {
  const logoImageUrl = useLogoImageUrl();
  return async (message: string) => {
    if (!pushSubscription) return;
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        body: truncate(message, PUSH_NOTIFICATION_MAX_LENGTH),
        icon: logoImageUrl,
        title: roomName,
      }),
    );
  };
};
